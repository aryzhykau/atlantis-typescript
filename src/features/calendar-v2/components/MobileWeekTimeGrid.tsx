import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';
import { useMobileDragDrop } from '../hooks/useMobileDragDrop';
import { useAutoScroll } from '../hooks/useAutoScroll';
import MobileDraggableEventCard from './MobileDraggableEventCard';
import MobileDropZone from './MobileDropZone';
import EventBottomSheet from './EventBottomSheet';
import EditEventBottomSheet from './EditEventBottomSheet';
import TransferEventBottomSheet from './TransferEventBottomSheet';
import CalendarTrainingChip from './CalendarTrainingChip';
import {
  useDeleteTrainingTemplateMutation,
  useDeleteRealTrainingMutation,
  useUpdateTrainingTemplateMutation,
  useUpdateRealTrainingMutation,
  useMoveTrainingTemplateMutation,
  useMoveRealTrainingMutation,
} from '../../../store/apis/calendarApi-v2';

interface MobileWeekTimeGridProps {
  eventsMap: Record<string, NormalizedEvent[]>;
  selectedDay?: Dayjs;
  hourStart?: number;
  hourEnd?: number;
  hourHeightPx?: number;
}

interface EventCardProps {
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

const EventCard: React.FC<EventCardProps> = ({ 
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
            sx={{
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
            }}
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
          sx={{
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
          }}
        />
      )}
    </>
  );
};

const MobileWeekTimeGrid: React.FC<MobileWeekTimeGridProps> = ({
  eventsMap,
  hourStart = 6,
  hourEnd = 23,
  hourHeightPx = 64,
  selectedDay,
}) => {
  const theme = useTheme();
  // dynamic adjustment for mobile browser chrome (address/toolbars)
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | NormalizedEvent[] | null>(null);
  const [bottomSheetMode, setBottomSheetMode] = useState<'event' | 'group'>('event');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NormalizedEvent | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [movingEvent, setMovingEvent] = useState<NormalizedEvent | null>(null);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  // Keep a local copy of eventsMap so we can optimistically modify UI (delete/transfer/edit)
  const [localEventsMap, setLocalEventsMap] = useState<Record<string, NormalizedEvent[]>>(eventsMap);
  
  // Create ref for the scrollable time grid container
  const timeGridRef = useRef<HTMLElement>(null!);
  
  const observerTargets = useRef<Map<string, IntersectionObserver>>(new Map());
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());

  // Mobile drag and drop functionality
  const { handleEventDrop } = useMobileDragDrop();

  // Auto-scroll functionality for drag operations
  const { handleMouseMove, stopAutoScroll } = useAutoScroll(timeGridRef, {
  threshold: 140, // Larger threshold for mobile so pointer slightly outside still triggers
  topThreshold: 220, // Larger top area for easier upward scrolling
  outerBuffer: 240, // Extra buffer outside container to trigger scroll when pointer is nearby
    speed: 8, // Slower speed for better control
    maxSpeed: 25,
    acceleration: 1.3,
  });

  // Handle mouse move for auto-scroll
  const handleMouseMoveEvent = useCallback((event: React.MouseEvent) => {
    handleMouseMove(event.clientX, event.clientY);
  }, [handleMouseMove]);

  // Handle drag start/end for auto-scroll
  const handleDragStart = useCallback(() => {
    // Auto-scroll will be triggered by handleMouseMove during drag
    console.log('Drag started - auto-scroll ready');
  }, []);

  const handleDragEnd = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  // Generate hours
  const hours = useMemo(() => {
    return Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i);
  }, [hourStart, hourEnd]);

  // Handle event click
  const handleEventClick = (event: NormalizedEvent) => {
    setSelectedEvent(event);
    setBottomSheetMode('event');
    setBottomSheetOpen(true);
  };

  const handleRequestEdit = (event: NormalizedEvent) => {
    // Close the details bottom sheet first so the edit sheet can appear on top.
    setBottomSheetOpen(false);
    // Small delay for closing animation to finish, then open edit sheet.
    setTimeout(() => {
      setEditingEvent(event);
      setEditSheetOpen(true);
    }, 220);
  };

  const handleRequestMove = (event: NormalizedEvent, _transferData?: any) => {
    // Close details and open transfer sheet on top
    setBottomSheetOpen(false);
    setTimeout(() => {
      setMovingEvent(event);
      setMoveSheetOpen(true);
    }, 220);
  };

  // Sync local map when prop updates
  useEffect(() => {
    setLocalEventsMap(eventsMap);
  }, [eventsMap]);

  // Delete handler for bottom sheet - remove event from local map
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // RTK Query mutations for deleting templates / real trainings
  const [deleteTrainingTemplate] = useDeleteTrainingTemplateMutation();
  const [deleteRealTraining] = useDeleteRealTrainingMutation();
  // RTK Query mutations for updating templates / real trainings
  const [updateTrainingTemplate] = useUpdateTrainingTemplateMutation();
  const [updateRealTraining] = useUpdateRealTrainingMutation();
  const [moveTrainingTemplate] = useMoveTrainingTemplateMutation();
  const [moveRealTraining] = useMoveRealTrainingMutation();

  // Save (edit) handler: optimistic update localEventsMap and call API
  const handleSaveEvent = useCallback(async (event: NormalizedEvent) => {
    if (!event) return;
    const backup = JSON.parse(JSON.stringify(localEventsMap));
    const dayKey = event.start?.format ? event.start.format('YYYY-MM-DD') : null;

    // Optimistically update local map
    setLocalEventsMap(prev => {
      const next = { ...prev };
      if (dayKey && Array.isArray(next[dayKey])) {
        next[dayKey] = next[dayKey].map(e => e.id === event.id ? event : e);
      } else {
        Object.keys(next).forEach(k => {
          next[k] = next[k].map(e => e.id === event.id ? event : e);
        });
      }
      return next;
    });

    try {
      if (event.isTemplate) {
        // prepare payload based on event.raw
        const trainingTypeId = event.raw?.training_type_id ?? event.raw?.training_type?.id ?? event.training_type?.id;
        const responsibleTrainerId = event.raw?.responsible_trainer_id ?? event.raw?.responsible_trainer?.id ?? event.trainer?.id;
        const payload = {
          id: Number(event.id),
          data: {
            day_number: event.raw?.day_number,
            start_time: event.raw?.start_time,
            training_type_id: trainingTypeId,
            responsible_trainer_id: responsibleTrainerId,
          },
        };
        await (updateTrainingTemplate as any)(payload).unwrap();
      } else {
        const payload = { id: Number(event.id), data: { training_date: event.raw?.training_date, start_time: event.raw?.start_time } };
        await (updateRealTraining as any)(payload).unwrap();
      }

  setSnackbar({ open: true, message: 'Событие обновлено', severity: 'success' });
  // keep the detail open logic to the caller so we can reopen after edit
    } catch (err: any) {
      // revert
      setLocalEventsMap(backup);
      setSnackbar({ open: true, message: err?.message || 'Ошибка при обновлении', severity: 'error' });
    }
  }, [localEventsMap]);

  const handleDeleteEvent = useCallback(async (event: NormalizedEvent) => {
    if (!event) return;
    // Optimistically remove locally, but keep a copy to revert on failure
    const backup = JSON.parse(JSON.stringify(localEventsMap));
    const dayKey = event.start?.format ? event.start.format('YYYY-MM-DD') : null;
    setLocalEventsMap(prev => {
      const next = { ...prev };
      if (dayKey && Array.isArray(next[dayKey])) {
        next[dayKey] = next[dayKey].filter(e => e.id !== event.id);
      } else {
        Object.keys(next).forEach(k => {
          next[k] = next[k].filter(e => e.id !== event.id);
        });
      }
      return next;
    });

    try {
      // Choose mutation based on whether this is a template
      if (event.isTemplate) {
        await deleteTrainingTemplate(Number(event.id)).unwrap();
      } else {
        await deleteRealTraining(Number(event.id)).unwrap();
      }
      setSnackbar({ open: true, message: 'Событие успешно удалено', severity: 'success' });
      setBottomSheetOpen(false);
      setSelectedEvent(null);
    } catch (err: any) {
      // revert
      setLocalEventsMap(backup);
      setSnackbar({ open: true, message: err?.message || 'Ошибка при удалении', severity: 'error' });
    }
  }, [localEventsMap]);

  const handleMoveEvent = useCallback(async (event: NormalizedEvent) => {
    if (!event) return;
    const backup = JSON.parse(JSON.stringify(localEventsMap));

    // Optimistically move locally
    const dayKey = event.start?.format ? event.start.format('YYYY-MM-DD') : null;
    setLocalEventsMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = next[k].filter((e: NormalizedEvent) => e.id !== event.id);
      });
      if (dayKey) {
        next[dayKey] = next[dayKey] ? [...next[dayKey], event] : [event];
      }
      return next;
    });

    try {
      setMoving(true);
      if (event.isTemplate) {
        const payload = { id: Number(event.id), dayNumber: Number(event.raw?.day_number), startTime: event.raw?.start_time };
        await (moveTrainingTemplate as any)(payload).unwrap();
      } else {
        const payload = { id: Number(event.id), trainingDate: event.raw?.training_date, startTime: event.raw?.start_time };
        await (moveRealTraining as any)(payload).unwrap();
      }
      setSnackbar({ open: true, message: 'Событие перенесено', severity: 'success' });
      // close transfer sheet and reopen detail sheet for the moved event
      setMoveSheetOpen(false);
      setMovingEvent(null);
      setTimeout(() => {
        setSelectedEvent(event);
        setBottomSheetMode('event');
        setBottomSheetOpen(true);
      }, 220);
    } catch (err: any) {
      setLocalEventsMap(backup);
      setSnackbar({ open: true, message: err?.message || 'Ошибка при переносе', severity: 'error' });
    } finally {
      setMoving(false);
    }
  }, [localEventsMap]);

  // Set up intersection observer for event cards
  useEffect(() => {
    const observers = observerTargets.current;
    
    // Clean up existing observers
    observers.forEach(observer => observer.disconnect());
    observers.clear();

    // Create new observers for event cards
    Object.entries(eventsMap).forEach(([dayKey, dayEvents]) => {
      hours.forEach(hour => {
        const events = dayEvents.filter(e => e.startHour === hour);
        
        // Observe all events to detect partial visibility
        events.forEach(event => {
          const observerKey = `${dayKey}-${hour}-${event.id}`;
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                setVisibleEvents(prev => {
                  const newSet = new Set(prev);
                  // Consider an event visible if at least 30% is visible
                  if (entry.intersectionRatio >= 0.3) {
                    newSet.add(observerKey);
                  } else {
                    newSet.delete(observerKey);
                  }
                  return newSet;
                });
              });
            },
            {
              threshold: [0, 0.3, 0.7, 1.0], // Multiple thresholds for better detection
              root: timeGridRef.current || null, // Use time grid container as root when available
            }
          );
          observers.set(observerKey, observer);
        });
      });
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
      observers.clear();
    };
  }, [eventsMap, hours, selectedDay]);

  // Listen to visualViewport changes to calculate extra bottom offset (mobile browser chrome)
  useEffect(() => {
    const update = () => {
      const vv = (window as any).visualViewport;
      if (vv && typeof vv.height === 'number') {
        // When toolbars are visible the visualViewport height is smaller than window.innerHeight
        const offset = Math.max(0, window.innerHeight - vv.height);
        setViewportOffset(offset);
      } else {
        setViewportOffset(0);
      }
    };

    update();
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', update);
      (window as any).visualViewport.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);

    return () => {
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', update);
        (window as any).visualViewport.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  const renderHourRow = (hour: number) => {
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    
    // Get selected day or default to today
  const activeDay = selectedDay || dayjs();
  const activeDayKey = activeDay.format('YYYY-MM-DD');
  const dayEvents = localEventsMap[activeDayKey]?.filter((e: NormalizedEvent) => e.startHour === hour) || [];
    
    return (
      <Box
        key={hour}
        sx={{
          display: 'flex',
          minHeight: `${hourHeightPx}px`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Time label */}
        <Box
          sx={{
            width: 60,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 2,
              height: '20%',
              background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: '0 2px 2px 0',
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {timeLabel}
          </Typography>
        </Box>

        {/* Event cards for this hour */}
    <MobileDropZone
      day={activeDay}
      time={`${hour.toString().padStart(2, '0')}:00`}
      onDrop={handleEventDrop}
      sx={{
    flex: 1,
  px: 0.5,
  py: 0,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollSnapType: 'x mandatory',
    touchAction: 'manipulation', // Allow both horizontal and vertical touch gestures
    minWidth: 0,
    position: 'relative',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            // Add subtle shadow hints when there are multiple events
            '&::before': dayEvents.length > 1 ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '3px',
              height: '50%',
              background: `linear-gradient(to right, ${theme.palette.primary.main}40, transparent)`,
              borderRadius: '0 2px 2px 0',
              pointerEvents: 'none',
              zIndex: 1,
            } : {},
            '&::after': dayEvents.length > 1 ? {
              content: '""',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '3px',
              height: '50%',
              background: `linear-gradient(to left, ${theme.palette.primary.main}40, transparent)`,
              borderRadius: '2px 0 0 2px',
              pointerEvents: 'none',
              zIndex: 1,
            } : {},
          }}
        >
          {/* All event cards */}
          {dayEvents.map((event: NormalizedEvent, index: number) => {
            const eventKey = `${activeDayKey}-${hour}-${event.id}`;
            const isInView = visibleEvents.has(eventKey);
            
            // More sophisticated partial hiding detection
            // With 160px events and typical mobile width (~320px available after time column),
            // we can show about 2 events fully. So events at positions 0, 1, and beyond
            // might be partially hidden depending on scroll position and total count
            const totalEvents = dayEvents.length;
            const isPartiallyHidden = totalEvents > 1 && (
              index === 0 || // First event can be hidden when scrolled right
              index >= 1      // Events after first can be hidden when there are multiple
            );
            
            return (
              <EventCard
                key={event.id}
                event={event}
                isVisible={isInView}
                isPartiallyHidden={isPartiallyHidden && totalEvents > 1}
                onClick={() => handleEventClick(event)}
                day={activeDay}
                time={`${hour.toString().padStart(2, '0')}:00`}
                isDragAndDropEnabled={true}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </MobileDropZone>
      </Box>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        paddingBottom: 0, // moved safe-area padding into inner scroll container
      }}>
  {/* Time grid */}
  {/** spacerPixel combines fixed buffer with runtime viewport offset */}
  {/* We'll render a bottom spacer inside the scroll container to ensure last rows are visible */}
  <Box
          ref={timeGridRef}
          data-scroll-container="time-grid"
          sx={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            minHeight: 0, // allow flex child to shrink and enable internal scrolling
            touchAction: 'pan-y pinch-zoom', // Prioritize vertical scrolling and allow pinch zoom
            WebkitOverflowScrolling: 'touch', // smooth native scrolling on iOS
            overscrollBehavior: 'contain', // prevent parent/page from scrolling when reaching edges
            backgroundColor: theme.palette.background.default,
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            // Add generous bottom padding so last rows are not obscured by mobile browser UI
            // Keep safe-area inset and add a buffer to accommodate address bars / toolbars
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 84px + ${viewportOffset}px)`,
            '--event-card-w': '160px',
            '--peek-w': '20px',
            '--hour-row-h': `${hourHeightPx}px`,
          }}
          onMouseMove={handleMouseMoveEvent}
        >
          {hours.map(renderHourRow)}
          {/* bottom spacer to ensure final rows are not covered by mobile chrome */}
          {(() => {
            const spacerPx = 72 + viewportOffset;
            return (
              <Box sx={{ height: `calc(env(safe-area-inset-bottom, 0px) + ${spacerPx}px)`, flexShrink: 0 }} />
            );
          })()}
        </Box>

        {/* Event Bottom Sheet */}
        <EventBottomSheet
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          eventOrHourGroup={selectedEvent}
          mode={bottomSheetMode}
          onDelete={handleDeleteEvent}
          onRequestEdit={handleRequestEdit}
          onRequestMove={handleRequestMove}
          onAssignedStudentDeleted={(trainingTemplateId: number, studentTemplateId: number) => {
            // Remove the assigned student from localEventsMap entries (templates may appear across days)
            setLocalEventsMap(prev => {
              const copy = JSON.parse(JSON.stringify(prev));
              Object.keys(copy).forEach(dayKey => {
                copy[dayKey] = copy[dayKey].map((e: NormalizedEvent) => {
                  if (e.isTemplate && e.raw && Number(e.id) === Number(trainingTemplateId)) {
                    // remove assigned_students with matching id
                    const assigned = (e.raw.assigned_students || []).filter((a: any) => a.id !== studentTemplateId);
                    return { ...e, raw: { ...e.raw, assigned_students: assigned } } as NormalizedEvent;
                  }
                  return e;
                });
              });
              return copy;
            });

            // If the detail sheet is open for the affected template, update selectedEvent so bottomsheet re-renders
            setSelectedEvent(prev => {
              if (!prev || Array.isArray(prev)) return prev;
              const idMatches = prev.isTemplate && Number(prev.id) === Number(trainingTemplateId);
              if (!idMatches) return prev;
              const newRaw = { ...prev.raw, assigned_students: (prev.raw.assigned_students || []).filter((a: any) => a.id !== studentTemplateId) };
              return { ...prev, raw: newRaw } as NormalizedEvent;
            });
          }}
        />
        <EditEventBottomSheet
          open={editSheetOpen}
          event={editingEvent}
          onClose={() => {
            setEditSheetOpen(false);
            // reopen detail sheet with the same event after close animation
            setTimeout(() => {
              if (editingEvent) {
                setSelectedEvent(editingEvent);
                setBottomSheetMode('event');
                setBottomSheetOpen(true);
              }
            }, 220);
          }}
          saving={savingEdit}
          onSave={async (updated) => {
            // forward to existing save handler and keep sheet open until done
            try {
              setSavingEdit(true);
              await handleSaveEvent(updated);
              // on success, close editor and reopen detail sheet for the updated event
              setEditSheetOpen(false);
              setTimeout(() => {
                setSelectedEvent(updated);
                setBottomSheetMode('event');
                setBottomSheetOpen(true);
              }, 220);
            } finally {
              setSavingEdit(false);
            }
          }}
        />
        <TransferEventBottomSheet
          open={moveSheetOpen}
          event={movingEvent}
          onClose={() => {
            setMoveSheetOpen(false);
            // reopen detail sheet with the original event after close animation
            setTimeout(() => {
              if (movingEvent) {
                setSelectedEvent(movingEvent);
                setBottomSheetMode('event');
                setBottomSheetOpen(true);
              }
              // clear movingEvent after reopening
              setMovingEvent(null);
            }, 220);
          }}
          moving={moving}
          onMove={(updated) => {
            // forwarded to handler which will perform API call and optimistic update
            handleMoveEvent(updated);
          }}
        />
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DndProvider>
  );
};

export default MobileWeekTimeGrid;
