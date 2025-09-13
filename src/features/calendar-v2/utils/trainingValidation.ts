import dayjs, { Dayjs } from 'dayjs';
import { NormalizedEvent } from './normalizeEventsForWeek';

/**
 * Check if a training is in the past
 */
export function isPastTraining(event: NormalizedEvent): boolean {
  if (event.isTemplate) return false; // Templates are not time-bound
  
  if (!event.raw?.training_date || !event.raw?.start_time) return false;
  
  const trainingDateTime = dayjs(`${event.raw.training_date} ${event.raw.start_time}`);
  return trainingDateTime.isBefore(dayjs());
}

/**
 * Check if a training is cancelled
 */
export function isCancelledTraining(event: NormalizedEvent): boolean {
  if (event.isTemplate) return false; // Templates cannot be cancelled
  
  return event.raw?.status === 'cancelled_by_coach' || event.raw?.status === 'cancelled_by_admin';
}

/**
 * Check if modifications are allowed for a training
 */
export function canModifyTraining(event: NormalizedEvent): boolean {
  return !isPastTraining(event) && !isCancelledTraining(event);
}

/**
 * Get cancellation safe time threshold (12 hours before training)
 */
export function getCancellationSafeTime(event: NormalizedEvent): Dayjs | null {
  if (event.isTemplate || !event.raw?.training_date || !event.raw?.start_time) return null;
  
  const trainingDateTime = dayjs(`${event.raw.training_date} ${event.raw.start_time}`);
  return trainingDateTime.subtract(12, 'hours');
}

/**
 * Check if student cancellation would be safe (no penalty)
 */
export function isSafeCancellation(event: NormalizedEvent, cancellationTime?: Dayjs): boolean {
  const safeTime = getCancellationSafeTime(event);
  if (!safeTime) return false;
  
  const cancelTime = cancellationTime || dayjs();
  return cancelTime.isBefore(safeTime);
}

/**
 * Format training date and time for display
 */
export function formatTrainingDateTime(event: NormalizedEvent): string {
  if (event.isTemplate) {
    // For templates, show day of week and time
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayName = dayNames[event.start.day()];
    const time = event.start.format('HH:mm');
    return `${dayName} в ${time}`;
  }
  
  // For real trainings, show full date and time
  return event.start.format('D MMMM YYYY в HH:mm');
}

/**
 * Get active students count (excluding cancelled)
 */
export function getActiveStudentsCount(event: NormalizedEvent): number {
  if (event.isTemplate) {
    return event.raw?.assigned_students?.length || 0;
  }
  
  if (!event.raw?.students) return 0;
  
  return event.raw.students.filter((s: any) => 
    s.status !== 'CANCELLED_SAFE' && s.status !== 'CANCELLED_PENALTY'
  ).length;
}

/**
 * Get cancelled students count
 */
export function getCancelledStudentsCount(event: NormalizedEvent): number {
  if (event.isTemplate) return 0; // Templates don't have cancelled students
  
  if (!event.raw?.students) return 0;
  
  return event.raw.students.filter((s: any) => 
    s.status === 'CANCELLED_SAFE' || s.status === 'CANCELLED_PENALTY'
  ).length;
}

/**
 * Check if training is at capacity
 */
export function isTrainingAtCapacity(event: NormalizedEvent): boolean {
  const maxParticipants = event.training_type?.max_participants;
  if (!maxParticipants) return false;
  
  const activeCount = getActiveStudentsCount(event);
  return activeCount >= maxParticipants;
}

/**
 * Get available spots in training
 */
export function getAvailableSpots(event: NormalizedEvent): number | null {
  const maxParticipants = event.training_type?.max_participants;
  if (!maxParticipants) return null;
  
  const activeCount = getActiveStudentsCount(event);
  return Math.max(0, maxParticipants - activeCount);
}
