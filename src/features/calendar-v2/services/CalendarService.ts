import { CalendarEvent } from '../types';
import { isTrainingTemplate, isRealTraining } from '../types/typeGuards';
import type { Dayjs } from 'dayjs';

/**
 * Calendar business logic service
 */
export class CalendarService {
  /**
   * Get events for a specific time slot
   */
  static getEventsForSlot(events: CalendarEvent[], day: Dayjs, time: string): CalendarEvent[] {
    return events.filter(event => {
      if (isTrainingTemplate(event)) {
        const dayNumber = day.day() === 0 ? 7 : day.day();
        return event.day_number === dayNumber && event.start_time === time;
      }
      
      if (isRealTraining(event)) {
        return day.format('YYYY-MM-DD') === event.training_date && event.start_time === time;
      }
      
      return false;
    });
  }

  /**
   * Check if a training can be duplicated
   */
  static canDuplicate(event: CalendarEvent): boolean {
    // Add business rules for duplication
    if (isRealTraining(event) && (event.status === 'cancelled_by_coach' || event.status === 'cancelled_by_admin')) {
      return false;
    }
    return true;
  }

  /**
   * Check if a training can be moved
   */
  static canMove(event: CalendarEvent): boolean {
    // Add business rules for moving
    if (isRealTraining(event) && (event.status === 'cancelled_by_coach' || event.status === 'cancelled_by_admin')) {
      return false;
    }
    return true;
  }

  /**
   * Get training capacity information
   */
  static getCapacityInfo(event: CalendarEvent): { current: number; max: number | null } {
    if (isTrainingTemplate(event)) {
      return {
        current: event.assigned_students?.length || 0,
        max: event.training_type?.max_participants || null,
      };
    }
    
    if (isRealTraining(event)) {
      return {
        current: event.students?.length || 0,
        max: event.training_type?.max_participants || null,
      };
    }
    
    return { current: 0, max: null };
  }

  /**
   * Check if training is at capacity
   */
  static isAtCapacity(event: CalendarEvent): boolean {
    const { current, max } = this.getCapacityInfo(event);
    return max !== null && current >= max;
  }

  /**
   * Calculate day number from Dayjs object for templates
   */
  static getDayNumber(day: Dayjs): number {
    return day.day() === 0 ? 7 : day.day();
  }
}
