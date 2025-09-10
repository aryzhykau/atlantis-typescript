import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import { Dayjs } from 'dayjs';

/**
 * Unified type for calendar events (templates and real trainings)
 */
export type CalendarEvent = TrainingTemplate | RealTraining;

/**
 * Calendar view mode type
 */
export type CalendarViewMode = 'scheduleTemplate' | 'actual';

/**
 * Calendar slot information
 */
export interface CalendarSlotInfo {
  date: Dayjs;
  time: string;
  events: CalendarEvent[];
}

/**
 * Calendar props interface
 */
export interface CalendarShellProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
  isLoading: boolean;
  error?: any;
}

/**
 * Drag and drop item interface
 */
export interface DragDropItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate?: boolean;
  isVirtualCopy?: boolean;
}
