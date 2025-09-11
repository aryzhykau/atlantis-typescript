/**
 * Demo component showcasing mobile drag & drop functionality
 * This can be used for testing and demonstration purposes
 */

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dayjs from 'dayjs';
import MobileDraggableEventCard from './MobileDraggableEventCard';
import MobileDropZone from './MobileDropZone';

// Mock event for demonstration
const mockEvent = {
  id: 1,
  training_date: dayjs().format('YYYY-MM-DD'),
  start_time: '10:00:00',
  training_type_id: 1,
  responsible_trainer_id: 1,
  status: 'planned' as const,
  training_type: {
    id: 1,
    name: 'Футбол',
    color: '#2196F3',
    max_participants: 20,
  },
  trainer: {
    id: 1,
    first_name: 'Иван',
    last_name: 'Петров',
  },
  students: [],
};

const MobileDragDropDemo: React.FC = () => {
  const theme = useTheme();

  const handleDrop = (event: any, _sourceDay: any, sourceTime: string, _targetDay: any, targetTime: string) => {
    console.log('📱 Demo drop:', { 
      eventId: event.id,
      from: sourceTime,
      to: targetTime 
    });
    
    // Show success message
    alert(`Event moved from ${sourceTime} to ${targetTime}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          p: 3,
          maxWidth: 400,
          mx: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography variant="h6" gutterBottom>
          📱 Mobile Drag & Drop Demo
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Drag the event card below to a different time slot
        </Typography>

        {/* Source time slot with draggable event */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            🕙 10:00 - Source
          </Typography>
          <MobileDraggableEventCard
            event={mockEvent}
            day={dayjs()}
            time="10:00"
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: '#2196F340',
                border: '1px solid #2196F3',
                cursor: 'grab',
                '&:hover': {
                  backgroundColor: '#2196F350',
                },
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                ⚽ Футбол
              </Typography>
              <Typography variant="caption">
                Иван Петров
              </Typography>
            </Box>
          </MobileDraggableEventCard>
        </Box>

        {/* Target time slots */}
        {['11:00', '12:00', '13:00'].map((time) => (
          <Box key={time} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              🕐 {time} - Drop Zone
            </Typography>
            <MobileDropZone
              day={dayjs()}
              time={time}
              onDrop={handleDrop}
              sx={{
                minHeight: 60,
                border: '2px dashed',
                borderColor: theme.palette.divider,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Drop event here for {time}
              </Typography>
            </MobileDropZone>
          </Box>
        ))}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          💡 Tip: Look for the drag handle (⋮⋮) icon on the event card
        </Typography>
      </Box>
    </DndProvider>
  );
};

export default MobileDragDropDemo;
