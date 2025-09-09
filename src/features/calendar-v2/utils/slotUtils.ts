/**
 * Utilities for efficient calendar slot management and event mapping
 */

import dayjs, { Dayjs } from 'dayjs';
import { CalendarEvent, isTrainingTemplate, isRealTraining } from '../components/CalendarShell';

/**
 * Creates a unique key for a calendar slot
 */
export const createSlotKey = (day: Dayjs, time: string): string => {
  return `${day.format('YYYY-MM-DD')}-${time}`;
};

/**
 * Gets the slot key for an event based on its type
 */
export const getEventSlotKey = (event: CalendarEvent): string | null => {
  if (isTrainingTemplate(event)) {
    // Convert day_number (1-7) to a day of week and create slot key
    // We need a reference date to convert day_number to actual date
    // For templates, we'll use a base date and calculate the day
    const baseDate = dayjs().startOf('isoWeek'); // Start of current week
    const eventDay = baseDate.add(event.day_number - 1, 'day'); // day_number 1 = Monday
    const time = event.start_time.substring(0, 5); // "HH:MM"
    return createSlotKey(eventDay, time);
  }
  
  if (isRealTraining(event)) {
    const eventDate = dayjs(event.training_date);
    const time = event.start_time.substring(0, 5); // "HH:MM"
    return createSlotKey(eventDate, time);
  }
  
  return null;
};

/**
 * Pre-computes event-to-slot mapping for efficient O(1) lookups
 */
export const createEventSlotMap = (
  events: CalendarEvent[], 
  viewMode: 'scheduleTemplate' | 'actualTrainings',
  currentWeekStart?: Dayjs
): Map<string, CalendarEvent[]> => {
  const slotMap = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    let slotKey: string | null = null;
    
    if (viewMode === 'scheduleTemplate' && isTrainingTemplate(event)) {
      // For templates, use the current week as reference
      const weekStart = currentWeekStart || dayjs().startOf('isoWeek');
      const eventDay = weekStart.add(event.day_number - 1, 'day');
      const time = event.start_time.substring(0, 5);
      slotKey = createSlotKey(eventDay, time);
    } else if (viewMode === 'actualTrainings' && isRealTraining(event)) {
      const eventDate = dayjs(event.training_date);
      const time = event.start_time.substring(0, 5);
      slotKey = createSlotKey(eventDate, time);
    }
    
    if (slotKey) {
      if (!slotMap.has(slotKey)) {
        slotMap.set(slotKey, []);
      }
      slotMap.get(slotKey)!.push(event);
    }
  });
  
  return slotMap;
};

/**
 * Gets events for a specific slot using pre-computed mapping
 */
export const getEventsForSlot = (
  slotMap: Map<string, CalendarEvent[]>, 
  day: Dayjs, 
  time: string
): CalendarEvent[] => {
  const slotKey = createSlotKey(day, time);
  return slotMap.get(slotKey) || [];
};

/**
 * Validates if a time slot is within valid calendar bounds
 */
export const isValidTimeSlot = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours >= 6 && hours <= 22 && minutes >= 0 && minutes < 60;
};

/**
 * Generates time slots for the calendar
 */
export const generateTimeSlots = (startHour = 6, endHour = 22): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(dayjs().hour(hour).minute(0).format('HH:mm'));
  }
  return slots;
};
