import React, { useState, useCallback } from 'react';
import { Box, useTheme, Typography, Chip } from '@mui/material';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { Student, StudentTemplate } from './types';
import { useEventStudentManagement } from '../../../hooks/useEventStudentManagement';
import { useEventDeletion } from '../../../hooks/useEventDeletion';

// Component imports
import EventHeader from './EventHeader';
import TrainerInfo from './TrainerInfo';
import StudentList from './StudentList';
import AssignedStudents from './AssignedStudents';
import AddStudentForm from './AddStudentForm';
import EventActions from './EventActions';
import DeleteConfirmation from './DeleteConfirmation';

interface SingleEventViewProps {
  event: NormalizedEvent;
  eventOrHourGroup: NormalizedEvent | NormalizedEvent[] | null;
  relatedEvents?: NormalizedEvent[];
  onSelectRelated?: (event: NormalizedEvent) => void;
  onClose: () => void;
  onRequestEdit?: (event: NormalizedEvent) => void;
  onRequestMove?: (event: NormalizedEvent, transferData?: any) => void;
  onDelete?: (event: NormalizedEvent) => void;
  onAssignedStudentDeleted?: (trainingTemplateId: number, studentTemplateId: number) => void;
}

/**
 * SingleEventView - Main component for displaying single event details
 * Single responsibility: Orchestrating single event display and interactions
 */
const SingleEventView: React.FC<SingleEventViewProps> = ({
  event,
  eventOrHourGroup,
  relatedEvents,
  onSelectRelated,
  onClose,
  onRequestEdit,
  onRequestMove,
  onDelete,
  onAssignedStudentDeleted,
}) => {
  const theme = useTheme();
  const [addingStudentOpen, setAddingStudentOpen] = useState(false);
  const [confirmingAssigned, setConfirmingAssigned] = useState<{ assigned: StudentTemplate; event: NormalizedEvent } | null>(null);

    // Custom hooks for business logic
  const {
    localEvent,
    filteredAvailableStudents,
    isCreatingAssigned,
    handleAddAssignedStudent,
    handleRemoveAssignedStudent,
  } = useEventStudentManagement(eventOrHourGroup, onAssignedStudentDeleted);

  const {
    pendingDeleteEvent,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useEventDeletion(onDelete);

  const typeColor = event.training_type?.color || theme.palette.primary.main;
  const otherEvents = (relatedEvents || []).filter(ev => ev.id !== event.id);

  // Event handlers
  const handleEdit = useCallback(() => {
    onRequestEdit?.(event);
  }, [event, onRequestEdit]);

  const handleMove = useCallback(() => {
    onRequestMove?.(event);
  }, [event, onRequestMove]);

  const handleToggleAddStudent = useCallback(() => {
    setAddingStudentOpen(prev => !prev);
  }, []);

  const handleStudentRemove = useCallback((studentTemplate: StudentTemplate, eventData: NormalizedEvent) => {
    setConfirmingAssigned({ assigned: studentTemplate, event: eventData });
  }, []);

  const handleAssignedDeleteConfirm = useCallback(async () => {
    if (!confirmingAssigned?.assigned) return;
    
    const success = await handleRemoveAssignedStudent(confirmingAssigned.assigned, confirmingAssigned.event);
    if (success) {
      setConfirmingAssigned(null);
    }
  }, [confirmingAssigned, handleRemoveAssignedStudent]);

  const handleAddStudent = useCallback(async (student: Student, startDate: string) => {
    const success = await handleAddAssignedStudent(student, startDate, event);
    if (success) {
      setAddingStudentOpen(false);
    }
  }, [handleAddAssignedStudent, event]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Event Header */}
      <EventHeader event={event} onClose={onClose} />

      {/* Related events in the same slot */}
      {otherEvents.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, mb: 1 }}>
            Другие в этот час
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {otherEvents.map(ev => (
              <Chip
                key={ev.id}
                label={ev.title}
                onClick={() => onSelectRelated?.(ev)}
                size="small"
                sx={{ fontWeight: 600, maxWidth: '100%' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Trainer Information */}
      <TrainerInfo trainer={event.trainer} typeColor={typeColor} />

      {/* Regular Students List */}
      {event.raw?.students && event.raw.students.length > 0 && (
        <StudentList
          students={event.raw.students}
          typeColor={typeColor}
          title="Ученики"
          maxDisplay={5}
        />
      )}

      {/* Assigned Students Management */}
      {(localEvent?.isTemplate || (event.raw?.assigned_students && event.raw.assigned_students.length > 0)) && (
        <AssignedStudents
          event={event}
          localEvent={localEvent}
          onStudentRemove={handleStudentRemove}
          onToggleAddStudent={handleToggleAddStudent}
          addingStudentOpen={addingStudentOpen}
        />
      )}

      {/* Add Student Form */}
      {addingStudentOpen && localEvent?.isTemplate && (
        <AddStudentForm
          availableStudents={filteredAvailableStudents}
          onAddStudent={handleAddStudent}
          onCancel={() => setAddingStudentOpen(false)}
          isLoading={isCreatingAssigned}
        />
      )}

      {/* Action Buttons */}
      <EventActions
        onEdit={handleEdit}
        onMove={handleMove}
        onDelete={() => handleDelete(event)}
      />

      {/* Delete Confirmation Bottom Sheet */}
      <DeleteConfirmation
        show={Boolean(pendingDeleteEvent)}
        eventTitle={pendingDeleteEvent?.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Confirm Delete Assigned Student Bottom Sheet */}
      {confirmingAssigned && (
        <DeleteConfirmation
          show={true}
          eventTitle={`${confirmingAssigned.assigned.student?.first_name} ${confirmingAssigned.assigned.student?.last_name}`}
          onConfirm={handleAssignedDeleteConfirm}
          onCancel={() => setConfirmingAssigned(null)}
        />
      )}
    </Box>
  );
};

export default SingleEventView;
