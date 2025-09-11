import dayjs, { Dayjs } from 'dayjs';

export interface NormalizedEvent {
  id: number;
  isTemplate: boolean;
  title: string;
  trainer?: {
    id: number;
    first_name?: string;
    last_name?: string;
  };
  training_type?: {
    id: number;
    name: string;
    color: string;
    max_participants?: number;
  };
  startHour: number; // 6..23
  start: Dayjs;
  end: Dayjs;
  durationMins: number; // Always 60
  raw: any; // Original event data
}

/**
 * Normalizes mixed template and real training events for a week view
 * @param events - Array of mixed template and real training events
 * @param weekStart - Start of the week (Monday)
 * @param hourStart - Starting hour for the grid (default 6, currently unused but kept for future extensibility)
 * @returns Record of date strings to normalized events
 */
export function normalizeEventsForWeek(
  events: any[], 
  weekStart: Dayjs, 
  _hourStart: number = 6
): Record<string, NormalizedEvent[]> {
  // Note: _hourStart parameter is reserved for future use (e.g., filtering events by hour range)
  const result: Record<string, NormalizedEvent[]> = {};
  
  // Initialize all days of the week
  for (let i = 0; i < 7; i++) {
    const dayKey = weekStart.add(i, 'day').format('YYYY-MM-DD');
    result[dayKey] = [];
  }

  events.forEach((event) => {
    if (!event) return;

    let normalizedEvent: NormalizedEvent | null = null;

    // Check if this is a template event (has day_number)
    if (event.day_number !== undefined && event.day_number !== null) {
      // Template event
      const dayNumber = Number(event.day_number);
      if (dayNumber >= 1 && dayNumber <= 7) {
        const eventDate = weekStart.add(dayNumber - 1, 'day'); // day_number 1 = Monday (index 0)
        const startTime = event.start_time || '09:00';
        
        // Parse start time (HH:mm or HH:mm:ss)
        const [hourStr, minuteStr] = startTime.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr || '0', 10);
        
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          const start = eventDate.hour(hour).minute(minute).second(0);
          const end = start.add(60, 'minute'); // All events are 60 minutes
          
          normalizedEvent = {
            id: event.id,
            isTemplate: true,
            title: event.training_type?.name || event.title || 'Тренировка',
            trainer: event.responsible_trainer || event.trainer,
            training_type: event.training_type,
            startHour: hour,
            start,
            end,
            durationMins: 60,
            raw: event
          };
        }
      }
    } else {
      // Real training event
      const trainingDate = event.training_date || event.date;
      const trainingDatetime = event.training_datetime;
      const startTime = event.start_time;
      
      let eventDate: Dayjs | null = null;
      let hour = 9; // default hour
      let minute = 0;
      
      if (trainingDatetime) {
        // Parse training_datetime if available
        eventDate = dayjs(trainingDatetime);
        hour = eventDate.hour();
        minute = eventDate.minute();
      } else if (trainingDate && startTime) {
        // Parse separate date and time
        eventDate = dayjs(trainingDate);
        const [hourStr, minuteStr] = startTime.split(':');
        hour = parseInt(hourStr, 10);
        minute = parseInt(minuteStr || '0', 10);
      } else if (trainingDate) {
        // Only date available, use default time
        eventDate = dayjs(trainingDate);
      }
      
      if (eventDate && eventDate.isValid() && !isNaN(hour) && hour >= 0 && hour <= 23) {
        const start = eventDate.hour(hour).minute(minute).second(0);
        const end = start.add(60, 'minute'); // All events are 60 minutes
        
        normalizedEvent = {
          id: event.id,
          isTemplate: false,
          title: event.training_type?.name || event.title || 'Тренировка',
          trainer: event.trainer || event.responsible_trainer,
          training_type: event.training_type,
          startHour: hour,
          start,
          end,
          durationMins: 60,
          raw: event
        };
      }
    }

    // Add to result if successfully normalized
    if (normalizedEvent) {
      const dayKey = normalizedEvent.start.format('YYYY-MM-DD');
      if (result[dayKey]) {
        result[dayKey].push(normalizedEvent);
      }
    }
  });

  // Sort events by start hour, then by id for stable sort
  Object.keys(result).forEach(dayKey => {
    result[dayKey].sort((a, b) => {
      if (a.startHour !== b.startHour) {
        return a.startHour - b.startHour;
      }
      return a.id - b.id;
    });
  });

  return result;
}
