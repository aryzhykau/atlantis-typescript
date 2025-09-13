import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { 
  useDeleteTrainingStudentTemplateMutation,
  useCreateTrainingStudentTemplateMutation,
} from '../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../store/apis/studentsApi';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';
import { Student, StudentTemplate } from '../components/EventBottomSheet/types';

/**
 * useEventStudentManagement - Custom hook for managing event student operations
 * Single responsibility: Student management business logic
 */
export const useEventStudentManagement = (
  eventOrHourGroup: NormalizedEvent | NormalizedEvent[] | null,
  onAssignedStudentDeleted?: (trainingTemplateId: number, studentTemplateId: number) => void
) => {
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();
  
  const [deleteTrainingStudentTemplate, { isLoading: isDeletingAssigned }] = useDeleteTrainingStudentTemplateMutation();
  const [createTrainingStudentTemplate, { isLoading: isCreatingAssigned }] = useCreateTrainingStudentTemplateMutation();
  const { data: allStudents } = useGetStudentsQuery();
  
  const [localEvent, setLocalEvent] = useState<NormalizedEvent | null>(
    !Array.isArray(eventOrHourGroup) ? eventOrHourGroup : null
  );

  // Memoize available students for better performance
  const availableStudents = useMemo(() => 
    (allStudents || []).filter((s: any) => s.is_active), 
    [allStudents]
  );

  // Filter available students to exclude already assigned ones
  const filteredAvailableStudents = useMemo(() => {
    if (!localEvent?.raw?.assigned_students) return availableStudents;
    
    const assignedStudentIds = new Set(
      localEvent.raw.assigned_students.map((assigned: any) => assigned.student?.id).filter(Boolean)
    );
    
    return availableStudents.filter((student: any) => !assignedStudentIds.has(student.id));
  }, [availableStudents, localEvent?.raw?.assigned_students]);

  const handleAddAssignedStudent = useCallback(async (
    selectedStudent: Student, 
    startDate: string,
    event: NormalizedEvent
  ) => {
    if (!selectedStudent) {
      displaySnackbar('Выберите ученика', 'warning');
      return false;
    }
    
    const evt = localEvent || event;
    if (!evt?.id) {
      displaySnackbar('Неверный шаблон', 'error');
      return false;
    }
    
    try {
      const payload = {
        training_template_id: evt.id,
        student_id: selectedStudent.id,
        start_date: startDate,
      };
      
      const created = await createTrainingStudentTemplate(payload).unwrap();
      const tId = created.training_template_id || evt.id;
      
      // Update cache optimistically
      try {
        (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplateById', tId, (draft: any) => {
          if (!draft) return;
          draft.assigned_students = draft.assigned_students || [];
          draft.assigned_students.push(created);
        }));
      } catch (e) {
        console.warn('Failed to update training template by id cache', e);
      }
      
      try {
        (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplates', undefined, (draft: any[]) => {
          if (!Array.isArray(draft)) return;
          const template = draft.find(t => t.id === tId);
          if (!template) return;
          template.assigned_students = template.assigned_students || [];
          template.assigned_students.push(created);
        }));
      } catch (e) {
        console.warn('Failed to update training templates cache', e);
      }
      
      dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: tId }]));
      
      // Update local state
      setLocalEvent((prev: NormalizedEvent | null) => {
        if (!prev) return prev;
        const next = { ...prev } as any;
        next.raw = { ...next.raw };
        next.raw.assigned_students = [...(next.raw.assigned_students || []), created];
        return next as NormalizedEvent;
      });
      
      displaySnackbar('Ученик добавлен в шаблон', 'success');
      return true;
    } catch (err) {
      console.error('[useEventStudentManagement] Failed to add assigned student:', err);
      displaySnackbar('Ошибка при добавлении ученика', 'error');
      return false;
    }
  }, [localEvent, createTrainingStudentTemplate, dispatch, displaySnackbar]);

  const handleRemoveAssignedStudent = useCallback(async (
    assignedStudent: StudentTemplate,
    event: NormalizedEvent
  ) => {
    const assignedId = assignedStudent.id;
    if (!assignedId) return false;

    try {
      const deleted = await deleteTrainingStudentTemplate(assignedId).unwrap();
      const templateId = (!Array.isArray(eventOrHourGroup) && eventOrHourGroup?.isTemplate) 
        ? eventOrHourGroup.id 
        : event?.id || assignedStudent?.training_template_id;
      
      if (deleted && deleted.id) {
        const tId = deleted.training_template_id || templateId;
        if (tId) {
          // Update cache optimistically
          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplateById', tId, (draft: any) => {
              if (!draft) return;
              draft.assigned_students = (draft.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {
            console.warn('Failed to update training template by id cache', e);
          }

          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplates', undefined, (draft: any[]) => {
              if (!Array.isArray(draft)) return;
              const template = draft.find(t => t.id === tId);
              if (!template) return;
              template.assigned_students = (template.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {
            console.warn('Failed to update training templates cache', e);
          }
        }
      }
      
      if (templateId) {
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateId }]));
      }
      
      try {
        const tIdNum = Number(deleted.training_template_id || templateId);
        if (!Number.isNaN(tIdNum)) onAssignedStudentDeleted?.(tIdNum, deleted.id);
      } catch (e) {
        console.warn('Failed to call onAssignedStudentDeleted callback', e);
      }
      
      displaySnackbar('Ученик удалён из шаблона', 'success');
      return true;
    } catch (err) {
      console.error('[useEventStudentManagement] Failed to delete assigned student:', err);
      displaySnackbar('Ошибка при удалении ученика из шаблона', 'error');
      return false;
    }
  }, [
    deleteTrainingStudentTemplate, 
    eventOrHourGroup, 
    dispatch, 
    onAssignedStudentDeleted, 
    displaySnackbar
  ]);

  return {
    localEvent,
    setLocalEvent,
    filteredAvailableStudents,
    isCreatingAssigned,
    isDeletingAssigned,
    handleAddAssignedStudent,
    handleRemoveAssignedStudent,
  };
};
