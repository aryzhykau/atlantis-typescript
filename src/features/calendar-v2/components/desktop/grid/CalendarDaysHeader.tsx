import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { CalendarViewMode } from '../layout/CalendarV2Page';

interface CalendarDaysHeaderProps {
  daysOfWeek: Dayjs[];
  isMobile: boolean;
  responsiveStyles: any;
  viewMode: CalendarViewMode;
}

/**
 * Header showing days of the week
 */
export const CalendarDaysHeader: React.FC<CalendarDaysHeaderProps> = ({
  daysOfWeek,
  isMobile,
  responsiveStyles,
  viewMode,
}) => {
  const theme = useTheme();
  const isTemplateMode = viewMode === 'scheduleTemplate';

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: `${responsiveStyles.timeColumnWidth} repeat(7, 1fr)`,
      gap: 0.5,
      pb: 1,
      mb: 1,
      position: 'sticky',

      top: 0,
      zIndex: 10,
    }}>
      {/* Empty space above time column */}
      <Box sx={{ backgroundColor: 'transparent' }} />
      
      {/* Day headers */}
      {daysOfWeek.map(day => (
        <Box
          key={day.format('YYYY-MM-DD')}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: theme.palette.background.default,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            p: { xs: 0.5, md: 1 },
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '60px',
            gap: 1,
          }}
        >
          {/* Day name */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              fontSize: responsiveStyles.fontSize,
              color: day.isSame(dayjs(), 'day') ? theme.palette.primary.main : theme.palette.text.primary,
              textTransform: 'capitalize',
              flex: 1,
            }}
          >
            {isMobile ? day.format('dd') : day.format('ddd')}
          </Typography>

          {/* Date and month - Only shown in non-template mode */}
          {!isTemplateMode && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: isMobile ? '24px' : '40px',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: day.isSame(dayjs(), 'day') ? 700 : 500,
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  color: day.isSame(dayjs(), 'day') ? theme.palette.primary.main : theme.palette.text.primary,
                  lineHeight: 1,
                }}
              >
                {day.format('D')}
              </Typography>
              {!isMobile && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.7rem',
                    color: theme.palette.text.secondary,
                    lineHeight: 1,
                    textTransform: 'capitalize',
                  }}
                >
                  {day.format('MMM')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};
