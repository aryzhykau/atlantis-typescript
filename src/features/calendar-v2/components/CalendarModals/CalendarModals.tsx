import React from 'react';
import TrainingTemplateForm from '../TrainingTemplateForm';
import TrainingTemplateModal from '../TrainingTemplateModal';
import RealTrainingModal from '../RealTrainingModal';
import { SlotEventsListModal } from '../SlotEventsListModal';
import { CalendarState } from '../../hooks/useCalendarState';

interface CalendarModalsProps {
  calendarState: CalendarState;
  calendarActions: any; // Use any for now since we pass the entire actions object
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

      {/* Slot Events List Modal */}
      {calendarState.slotEventsListModal.isOpen && calendarState.slotEventsListModal.day && (
        <SlotEventsListModal
          open={calendarState.slotEventsListModal.isOpen}
          onClose={calendarActions.closeSlotEventsList}
          day={calendarState.slotEventsListModal.day}
          time={calendarState.slotEventsListModal.time || ''}
          events={calendarState.slotEventsListModal.events}
          isTemplate={calendarState.slotEventsListModal.isTemplate}
          onEventClick={(event) => {
            const eventType = 'day_number' in event ? 'template' : 'real';
            calendarActions.openEventModal(event.id, eventType);
          }}
          onAddNewEvent={() => {
            if (calendarState.slotEventsListModal.day && calendarState.slotEventsListModal.time) {
              calendarActions.openCreateForm({ 
                date: calendarState.slotEventsListModal.day, 
                time: calendarState.slotEventsListModal.time 
              });
            }
          }}
        />
      )}
    </>
  );
};
