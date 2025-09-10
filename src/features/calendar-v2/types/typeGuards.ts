import type { CalendarEvent } from './index';
import type { TrainingTemplate } from '../models/trainingTemplate';
import type { RealTraining } from '../models/realTraining';

/**
 * Type guard to check if event is a TrainingTemplate
 */
export function isTrainingTemplate(event: CalendarEvent): event is TrainingTemplate {
  return 'day_number' in event && typeof event.day_number === 'number';
}

/**
 * Type guard to check if event is a RealTraining
 */
export function isRealTraining(event: CalendarEvent): event is RealTraining {
  return 'training_date' in event && 'trainer' in event;
}

/**
 * Type guard to check if event has students
 */
export function hasStudents(event: CalendarEvent): boolean {
  if (isTrainingTemplate(event)) {
    return Boolean(event.assigned_students?.length);
  }
  if (isRealTraining(event)) {
    return Boolean(event.students?.length);
  }
  return false;
}

/**
 * Type guard to check if event is cancelled
 */
export function isCancelledEvent(event: CalendarEvent): boolean {
  if (isRealTraining(event)) {
    return event.status === 'cancelled_by_coach' || event.status === 'cancelled_by_admin';
  }
  return false;
}
