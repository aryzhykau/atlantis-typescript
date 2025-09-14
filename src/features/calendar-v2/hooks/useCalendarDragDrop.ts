/**
 * Custom hook for managing calendar drag & drop operations with optimistic updates
 */

import { useCallback, useState } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../types';
import { isTrainingTemplate, isRealTraining } from '../types/typeGuards';
import { CalendarViewMode } from '../components/desktop/layout/CalendarV2Page';
import { 
  useMoveTrainingTemplateMutation, 
  useMoveRealTrainingMutation,
  useCreateTrainingTemplateMutation,
  useCreateRealTrainingMutation,
  useCreateTrainingStudentTemplateMutation,
  useAddStudentToRealTrainingMutation,
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery
} from '../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { debugLog } from '../utils/debug';
import { TrainingTemplateCreate } from '../models/trainingTemplate';
import { RealTrainingCreate } from '../models/realTraining';
import { TrainingStudentTemplateCreate } from '../models/trainingStudentTemplate';

export interface UseDragDropReturn {
  handleTrainingDrop: (
    event: CalendarEvent,
    sourceDay: Dayjs,
    sourceTime: string,
    targetDay: Dayjs,
    targetTime: string,
    targetSlotEvents: CalendarEvent[],
    isDuplicate?: boolean
  ) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for managing calendar drag & drop operations
 */
export const useCalendarDragDrop = (
  _viewMode: CalendarViewMode,
  currentDate: Dayjs
): UseDragDropReturn => {
  const { displaySnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  
  // API mutations
  const [moveTrainingTemplate] = useMoveTrainingTemplateMutation();
  const [moveRealTraining] = useMoveRealTrainingMutation();
  const [createTrainingTemplate] = useCreateTrainingTemplateMutation();
  const [createRealTraining] = useCreateRealTrainingMutation();
  const [createTrainingStudentTemplate] = useCreateTrainingStudentTemplateMutation();
  const [addStudentToRealTraining] = useAddStudentToRealTrainingMutation();
  
  // Queries for cache invalidation
  const { refetch: refetchTemplates } = useGetTrainingTemplatesQuery();
  const { refetch: refetchRealTrainings } = useGetRealTrainingsQuery({
    startDate: currentDate.startOf('isoWeek').format('YYYY-MM-DD'),
    endDate: currentDate.endOf('isoWeek').format('YYYY-MM-DD'),
  });

  const handleMove = useCallback(async (
    event: CalendarEvent,
    targetDay: Dayjs,
    targetTime: string
  ) => {
    setIsLoading(true);
    
    // Show optimistic loading message
    const operationMessage = `Перемещение "${event.training_type?.name}"...`;
    displaySnackbar(operationMessage, 'info');

    try {
      if (isTrainingTemplate(event)) {
        const dayNumber = targetDay.day() === 0 ? 7 : targetDay.day();
        
        await moveTrainingTemplate({
          id: event.id,
          dayNumber,
          startTime: targetTime,
        }).unwrap();
        
        debugLog('🎉 Перемещение шаблона завершено успешно');
        displaySnackbar(`✅ Шаблон тренировки "${event.training_type?.name}" перемещен`, 'success');
      } else if (isRealTraining(event)) {
        const trainingDate = targetDay.format('YYYY-MM-DD');
        
        await moveRealTraining({
          id: event.id,
          trainingDate,
          startTime: targetTime,
        }).unwrap();
        
        debugLog('🎉 Перемещение тренировки завершено успешно');
        displaySnackbar(`✅ Тренировка "${event.training_type?.name}" перемещена`, 'success');
      }
    } finally {
      setIsLoading(false);
    }
  }, [moveTrainingTemplate, moveRealTraining, displaySnackbar, setIsLoading]);

  const handleDuplicate = useCallback(async (
    event: CalendarEvent,
    targetDay: Dayjs,
    targetTime: string
  ) => {
    setIsLoading(true);
    
    // Show optimistic loading message
    const operationMessage = `Дублирование "${event.training_type?.name}"...`;
    displaySnackbar(operationMessage, 'info');

    try {
      if (isTrainingTemplate(event)) {
        const dayNumber = targetDay.day() === 0 ? 7 : targetDay.day();
        const originalStudents = event.assigned_students || [];
        
        const newTemplate: TrainingTemplateCreate = {
          training_type_id: event.training_type?.id!,
          responsible_trainer_id: event.responsible_trainer?.id!,
          day_number: dayNumber,
          start_time: targetTime,
        };
        
        // Create template first
        const createdTemplate = await createTrainingTemplate(newTemplate).unwrap();
        
          // Add students if any
          if (originalStudents.length > 0) {
            const studentPromises = originalStudents.map(async (studentTemplate) => {
              try {
                const studentData: TrainingStudentTemplateCreate = {
                  training_template_id: createdTemplate.id,
                  student_id: studentTemplate.student.id,
                  start_date: studentTemplate.start_date,
                  is_frozen: studentTemplate.is_frozen,
                };
                return await createTrainingStudentTemplate(studentData).unwrap();
              } catch (error) {
                console.warn(`Failed to add student template ${studentTemplate.student.id}:`, error);
                return null; // Return null for failed additions
              }
            });
            
            const results = await Promise.allSettled(studentPromises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
            const failCount = originalStudents.length - successCount;
            
            if (failCount > 0) {
              console.warn(`${failCount} student templates failed to be added to template ${createdTemplate.id}`);
            }
          }      debugLog('🎉 Дублирование шаблона завершено успешно');
        const studentCount = originalStudents.length;
        const studentText = studentCount > 0 ? ` (со ${studentCount} студентами)` : '';
        displaySnackbar(`📋 Шаблон тренировки "${event.training_type?.name}" продублирован${studentText}`, 'success');
        
        refetchTemplates();
      } else if (isRealTraining(event)) {
        const trainingDate = targetDay.format('YYYY-MM-DD');
        const originalStudents = event.students || [];
        
        const newTraining: RealTrainingCreate = {
          training_type_id: event.training_type?.id!,
          responsible_trainer_id: event.trainer?.id!,
          training_date: trainingDate,
          start_time: targetTime,
        };
        
        // Create training first
        const createdTraining = await createRealTraining(newTraining).unwrap();
        
        // Add students if any
        if (originalStudents.length > 0) {
          const studentPromises = originalStudents.map(async (trainingStudent) => {
            try {
              return await addStudentToRealTraining({
                training_id: createdTraining.id,
                student_id: trainingStudent.student.id,
              }).unwrap();
            } catch (error) {
              console.warn(`Failed to add student ${trainingStudent.student.id}:`, error);
              return null; // Return null for failed additions
            }
          });
          
          const results = await Promise.allSettled(studentPromises);
          const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
          const failCount = originalStudents.length - successCount;
          
          if (failCount > 0) {
            console.warn(`${failCount} students failed to be added to training ${createdTraining.id}`);
          }
        }
        
        debugLog('🎉 Дублирование тренировки завершено успешно');
        const studentCount = originalStudents.length;
        const studentText = studentCount > 0 ? ` (со ${studentCount} студентами)` : '';
        displaySnackbar(`📋 Тренировка "${event.training_type?.name}" продублирована${studentText}`, 'success');
        
        refetchRealTrainings();
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    createTrainingTemplate,
    createRealTraining,
    createTrainingStudentTemplate,
    addStudentToRealTraining,
    displaySnackbar,
    refetchTemplates,
    refetchRealTrainings,
    setIsLoading
  ]);

  const handleTrainingDrop = useCallback(async (
    event: CalendarEvent,
    sourceDay: Dayjs,
    sourceTime: string,
    targetDay: Dayjs,
    targetTime: string,
    targetSlotEvents: CalendarEvent[],
    isDuplicate: boolean = false
  ) => {
    // Check if position actually changed
    if (sourceDay.isSame(targetDay, 'day') && sourceTime === targetTime) {
      return;
    }

    // Prevent multiple simultaneous operations
    if (isLoading) {
      debugLog('⚠️ Операция уже выполняется, игнорируем новый запрос');
      return;
    }

    // Frontend trainer conflict check
    // TrainingTemplate uses responsible_trainer_id, RealTraining uses trainer.id
    let trainerId: number | undefined;
    if (isTrainingTemplate(event)) {
      trainerId = event.responsible_trainer_id;
    } else if (isRealTraining(event) && event.trainer) {
      trainerId = event.trainer.id;
    }
    if (trainerId) {
      const conflict = targetSlotEvents.some(e => {
        let slotTrainerId: number | undefined;
        if (isTrainingTemplate(e)) {
          slotTrainerId = e.responsible_trainer_id;
        } else if (isRealTraining(e) && e.trainer) {
          slotTrainerId = e.trainer.id;
        }
        return slotTrainerId === trainerId && e.id !== event.id;
      });
      if (conflict) {
        displaySnackbar('❌ Тренер уже занят в этом слоте!', 'error');
        return;
      }
    }

    debugLog(`🚀 Начинаем ${isDuplicate ? 'дублирование' : 'перемещение'} с react-dnd:`, {
      eventId: event.id,
      from: `${sourceDay.format('ddd')} ${sourceTime}`,
      to: `${targetDay.format('ddd')} ${targetTime}`,
      isDuplicate
    });

    try {
      if (isDuplicate) {
        await handleDuplicate(event, targetDay, targetTime);
      } else {
        await handleMove(event, targetDay, targetTime);
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при ${isDuplicate ? 'дублировании' : 'перемещении'} тренировки:`, error);
      const errorMessage = error?.data?.detail || error?.message || 'Неизвестная ошибка';
      displaySnackbar(`❌ Не удалось ${isDuplicate ? 'продублировать' : 'переместить'} тренировку: ${errorMessage}`, 'error');
    }
  }, [handleMove, handleDuplicate, isLoading, displaySnackbar]);

  return {
    handleTrainingDrop,
    isLoading
  };
};
