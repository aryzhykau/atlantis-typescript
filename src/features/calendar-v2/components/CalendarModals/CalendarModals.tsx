import React from 'react';
import TrainingTemplateForm from '../TrainingTemplateForm';
import TrainingTemplateModal from '../TrainingTemplateModal';
import RealTrainingModal from '../RealTrainingModal';
import { CalendarState } from '../../hooks/useCalendarState';

interface CalendarModalsProps {
  calendarState: CalendarState;
  calendarActions: {
    closeCreateForm: () => void;
    closeEventModal: () => void;
  };
}

/**
 * Container for all calendar modals and forms
 */
export const CalendarModals: React.FC<CalendarModalsProps> = ({
  calendarState,
  calendarActions,
}) => {
  return (
    <>
      {/* Training Template Creation Form */}
      {calendarState.createForm.isOpen && calendarState.createForm.selectedSlot && (
        <TrainingTemplateForm 
          open={calendarState.createForm.isOpen}
          onClose={calendarActions.closeCreateForm}
          selectedDate={calendarState.createForm.selectedSlot.date}
          selectedTime={calendarState.createForm.selectedSlot.time}
        />
      )}

      {/* Training Template Detail Modal */}
      {calendarState.eventModal.type === 'template' && (
        <TrainingTemplateModal 
          open={calendarState.eventModal.isOpen}
          onClose={calendarActions.closeEventModal}
          templateId={calendarState.eventModal.eventId}
        />
      )}

      {/* Real Training Detail Modal */}
      {calendarState.eventModal.type === 'real' && (
        <RealTrainingModal 
          open={calendarState.eventModal.isOpen}
          onClose={calendarActions.closeEventModal}
          trainingId={calendarState.eventModal.eventId}
        />
      )}
    </>
  );
};
