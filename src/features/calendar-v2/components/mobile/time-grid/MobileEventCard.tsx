import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { Dayjs } from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import MobileDraggableEventCard from '../drag-drop/MobileDraggableEventCard';
import CalendarTrainingChip from '../../shared/event-cards/CalendarTrainingChip';

interface MobileEventCardProps {
  event: NormalizedEvent;
  isVisible: boolean;
  onClick: () => void;
  isPartiallyHidden?: boolean;
  onIntersectionChange?: (ratio: number) => void;
  day: Dayjs;
  time: string;
  isDragAndDropEnabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Mobile-optimized event card with intersection observer and visual feedback
 * Handles both draggable and static versions based on props
 */
const MobileEventCard: React.FC<MobileEventCardProps> = ({ 
  event, 
  isVisible, 
  onClick, 
  isPartiallyHidden, 
  onIntersectionChange,
  day,
  time,
  isDragAndDropEnabled = true,
  onDragStart,
  onDragEnd,
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIntersectionRatio, setCurrentIntersectionRatio] = useState(1);

  // Set up intersection observer for this specific card
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const ratio = entry.intersectionRatio;
          setCurrentIntersectionRatio(ratio);
          onIntersectionChange?.(ratio);
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        root: element.closest('[data-scroll-container]'), // Use scroll container as root
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onIntersectionChange]);

  const typeColor = event.training_type?.color || theme.palette.primary.main;
  
  // Interpolate border radius based on intersection ratio
  // When fully visible (ratio = 1): normal border radius (8px)
  // When partially hidden (ratio < 1): more rounded for visual effect (up to 32px)
  const baseBorderRadius = 8; // px
  const maxBorderRadius = 32; // px
  const activeRatio = currentIntersectionRatio; // Use the live intersection ratio
  const interpolatedBorderRadius = baseBorderRadius + (maxBorderRadius - baseBorderRadius) * (1 - activeRatio);
  
  // Common card styles
  const cardStyles = {
    height: isPartiallyHidden 
      ? 'calc(var(--hour-row-h, 44px) - 16px)' 
      : 'calc(var(--hour-row-h, 44px) - 8px)',
    width: '120px', // Fixed width for event cards
    minWidth: '120px',
    maxWidth: '120px',
    scrollSnapAlign: 'start',
    opacity: isVisible ? 1 : 0.8,
    transform: isPartiallyHidden 
      ? 'scale(0.9)' 
      : isVisible ? 'scale(1)' : 'scale(0.95)',
    transition: theme.transitions.create(['opacity', 'transform', 'height', 'border-radius'], {
      duration: theme.transitions.duration.short,
    }),
    borderRadius: `${interpolatedBorderRadius}px`,
    boxShadow: theme.shadows[1],
    background: `linear-gradient(135deg, ${typeColor}20 0%, ${typeColor}10 100%)`,
    overflow: 'hidden',
  };
  
  return (
    <>
      {isDragAndDropEnabled ? (
        <MobileDraggableEventCard
          event={event.raw}
          day={day}
          time={time}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <CalendarTrainingChip
            ref={cardRef}
            event={event.raw}
            isMobile={true}
            isTablet={false}
            onEventClick={onClick}
            isDragActive={false}
            showDragHandle={true}
            sx={cardStyles}
          />
        </MobileDraggableEventCard>
      ) : (
        <CalendarTrainingChip
          ref={cardRef}
          event={event.raw}
          isMobile={true}
          isTablet={false}
          onEventClick={onClick}
          isDragActive={false}
          showDragHandle={false}
          sx={cardStyles}
        />
      )}
    </>
  );
};

export default MobileEventCard;
