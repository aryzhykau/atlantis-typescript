import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  useTheme,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { CalendarViewMode } from './CalendarV2Page';

interface TabsContainerProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onOpenMonthPicker?: () => void;
}

const TabsContainer: React.FC<TabsContainerProps> = ({
  viewMode,
  onViewModeChange,
  onOpenMonthPicker,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Month picker button */}
      <IconButton
        onClick={onOpenMonthPicker}
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          borderRadius: theme.spacing(1),
          width: 40,
          height: 40,
          transition: theme.transitions.create(['background', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            background: theme.palette.primary.dark,
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <CalendarIcon />
      </IconButton>

      {/* View mode tabs */}
      <Tabs
        value={viewMode}
        onChange={(_, value) => onViewModeChange(value)}
        variant="fullWidth"
        sx={{
          flex: 1,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTab-root': {
            borderRadius: theme.spacing(1),
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: theme.palette.text.secondary,
            minHeight: 40,
            transition: theme.transitions.create(['background', 'color'], {
              duration: theme.transitions.duration.short,
            }),
            '&.Mui-selected': {
              background: theme.palette.primary.main,
              color: 'white',
            },
            '&:hover:not(.Mui-selected)': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main,
            },
          },
        }}
      >
          <Tab
            label="📋 Шаблон"
            value="scheduleTemplate"
          />
          <Tab
            label="🏃‍♂️ Тренировки"
            value="actualTrainings"
          />
        </Tabs>
      </Box>
    );
  };

  export default TabsContainer;
