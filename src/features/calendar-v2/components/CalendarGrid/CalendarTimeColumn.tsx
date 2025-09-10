import React from 'react';
import { Box, Typography } from '@mui/material';

interface CalendarTimeColumnProps {
  timeSlots: string[];
  responsiveStyles: any;
}

/**
 * Left column showing time slots
 */
export const CalendarTimeColumn: React.FC<CalendarTimeColumnProps> = ({
  timeSlots,
  responsiveStyles,
}) => {
  return (
    <Box sx={{
      width: responsiveStyles.timeColumnWidth,
      flexShrink: 0,
      pr: 1,
    }}>
      {timeSlots.map(time => (
        <Box
          key={time}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: responsiveStyles.slotHeight,
            mb: 0.5,
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: responsiveStyles.fontSize,
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {time}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
