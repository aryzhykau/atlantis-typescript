/**
 * Custom hook for managing calendar drag & drop operations
 */

import { useCallback } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent, isTrainingTemplate, isRealTraining } from '../components/CalendarShell';
import { CalendarViewMode } from '../components/CalendarV2Page';
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
    isDuplicate?: boolean
  ) => Promise<void>;
}

/**
 * Hook for managing calendar drag & drop operations
 */
export const useCalendarDragDrop = (
  viewMode: CalendarViewMode,
  currentDate: Dayjs
): UseDragDropReturn => {
  const { displaySnackbar } = useSnackbar();
  
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
  }, [moveTrainingTemplate, moveRealTraining, displaySnackbar]);

  const handleDuplicate = useCallback(async (
    event: CalendarEvent,
    targetDay: Dayjs,
    targetTime: string
  ) => {
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
          const studentData: TrainingStudentTemplateCreate = {
            training_template_id: createdTemplate.id,
            student_id: studentTemplate.student.id,
            start_date: studentTemplate.start_date,
            is_frozen: studentTemplate.is_frozen,
          };
          return createTrainingStudentTemplate(studentData).unwrap();
        });
        
        await Promise.all(studentPromises);
      }
      
      debugLog('🎉 Дублирование шаблона завершено успешно');
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
          return addStudentToRealTraining({
            training_id: createdTraining.id,
            student_id: trainingStudent.student.id,
          }).unwrap();
        });
        
        await Promise.all(studentPromises);
      }
      
      debugLog('🎉 Дублирование тренировки завершено успешно');
      const studentCount = originalStudents.length;
      const studentText = studentCount > 0 ? ` (со ${studentCount} студентами)` : '';
      displaySnackbar(`📋 Тренировка "${event.training_type?.name}" продублирована${studentText}`, 'success');
      
      refetchRealTrainings();
    }
  }, [
    createTrainingTemplate,
    createRealTraining,
    createTrainingStudentTemplate,
    addStudentToRealTraining,
    displaySnackbar,
    refetchTemplates,
    refetchRealTrainings
  ]);

  const handleTrainingDrop = useCallback(async (
    event: CalendarEvent, 
    sourceDay: Dayjs, 
    sourceTime: string, 
    targetDay: Dayjs, 
    targetTime: string,
    isDuplicate: boolean = false
  ) => {
    // Check if position actually changed
    if (sourceDay.isSame(targetDay, 'day') && sourceTime === targetTime) {
      return;
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
  }, [handleMove, handleDuplicate]);

  return {
    handleTrainingDrop
  };
};
