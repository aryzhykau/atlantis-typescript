import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
} from '@mui/material';
import {
  CalendarToday as ScheduleIcon,
  CheckCircle as AttendanceIcon,
  Payment as PaymentIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { TrainerSchedule } from './TrainerSchedule';
import { TrainerAttendance } from './TrainerAttendance';
import { TrainerPayments } from './TrainerPayments';
import { TrainerStats } from './TrainerStats';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ 
        height: '100%', 
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      {value === index && children}
    </Box>
  );
}

export const TrainerMobileApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Atlantis
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TabPanel value={currentTab} index={0}>
          <TrainerSchedule />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <TrainerAttendance />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <TrainerPayments />
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <TrainerStats />
        </TabPanel>
      </Box>

      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1000,
        }}
        elevation={8}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.7rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<ScheduleIcon />}
            label="Расписание"
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
          <Tab
            icon={<AttendanceIcon />}
            label="Посещения"
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
          <Tab
            icon={<PaymentIcon />}
            label="Платежи"
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
          <Tab
            icon={<StatsIcon />}
            label="Статистика"
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        </Tabs>
      </Paper>
    </Box>
  );
}; 