/**
 * Utilities for event display and formatting
 */

import { Theme } from '@mui/material/styles';
import { CalendarEvent } from '../types';
import { isTrainingTemplate, isRealTraining } from '../types/typeGuards';
import { calculateCapacity, formatCapacityText, shouldShowCapacityBadge } from './capacityUtils';

export interface EventDisplayData {
  typeColor: string;
  trainerName: string;
  studentCount: number;
  maxParticipants: number | null;
  capacityInfo: ReturnType<typeof calculateCapacity>;
  capacityText: string;
  showCapacityBadge: boolean;
  trainingTypeName: string;
}

/**
 * Gets trainer display name from event
 */
export const getTrainerDisplayName = (event: CalendarEvent): string => {
  if (isTrainingTemplate(event) && event.responsible_trainer) {
    const { first_name = '', last_name = '' } = event.responsible_trainer;
    return `${first_name} ${last_name ? last_name.charAt(0) + '.' : ''}`.trim();
  }
  
  if (isRealTraining(event) && event.trainer) {
    const { first_name = '', last_name = '' } = event.trainer;
    return `${first_name} ${last_name ? last_name.charAt(0) + '.' : ''}`.trim();
  }
  
  return 'Без тренера';
};

/**
 * Gets student count from event
 */
export const getStudentCount = (event: CalendarEvent): number => {
  if (isTrainingTemplate(event) && event.assigned_students) {
    return event.assigned_students.length;
  }
  
  if (isRealTraining(event) && event.students) {
    return event.students.length;
  }
  
  return 0;
};

/**
 * Creates complete display data for an event chip
 */
export const createEventDisplayData = (event: CalendarEvent, theme: Theme): EventDisplayData => {
  const typeColor = event.training_type?.color || theme.palette.primary.main;
  const trainerName = getTrainerDisplayName(event);
  const studentCount = getStudentCount(event);
  const maxParticipants = event.training_type?.max_participants || null;
  const trainingTypeName = event.training_type?.name || 'Тренировка';
  
  // Calculate capacity information
  const capacityInfo = calculateCapacity(studentCount, maxParticipants);
  const capacityText = formatCapacityText(capacityInfo);
  const showCapacityBadge = shouldShowCapacityBadge(capacityInfo);
  
  return {
    typeColor,
    trainerName,
    studentCount,
    maxParticipants,
    capacityInfo,
    capacityText,
    showCapacityBadge,
    trainingTypeName
  };
};

/**
 * Creates tooltip content data for an event
 */
export const createTooltipContent = (displayData: EventDisplayData) => ({
  title: displayData.trainingTypeName,
  trainer: `👨 ${displayData.trainerName}`,
  students: `👥 Студентов: ${displayData.capacityText}`,
  status: (() => {
    if (!displayData.maxParticipants || displayData.maxParticipants >= 999) {
      return null;
    }
    
    const { capacityInfo } = displayData;
    if (capacityInfo.isFull) {
      return { text: '⚠️ Группа переполнена', color: '#ffcdd2' };
    }
    if (capacityInfo.percentage >= 90) {
      return { text: '⚠️ Почти заполнена', color: '#ffcdd2' };
    }
    if (capacityInfo.percentage >= 70) {
      return { text: '⚡ Заполняется', color: '#e8f5e8' };
    }
    return { text: '✅ Есть свободные места', color: '#e8f5e8' };
  })()
});

/**
 * Responsive style configurations
 */
export const getResponsiveChipStyles = (isMobile: boolean, isTablet: boolean) => ({
  maxWidth: isMobile ? '80px' : (isTablet ? '100px' : '120px'),
  fontSize: {
    main: isMobile ? '0.6rem' : '0.65rem',
    secondary: '0.6rem'
  }
});
