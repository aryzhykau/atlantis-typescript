import React from 'react';
import { Box, Paper, BottomNavigation, useTheme, BottomNavigationAction } from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as StatsIcon,
  CalendarToday as ScheduleIcon,
  CheckCircle as AttendanceIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGradients } from '../features/trainer-mobile/hooks/useGradients';

interface MobileTrainerLayoutProps {
  children: React.ReactNode;
}

export const MobileTrainerLayout: React.FC<MobileTrainerLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const gradients = useGradients();

  // Определяем текущую страницу
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/payments')) return 0;
    if (path.includes('/stats')) return 1;
    if (path.includes('/schedule')) return 2;
    if (path.includes('/attendance')) return 3;
    if (path.includes('/profile')) return 4;
    return 0; // По умолчанию платежи
  };

  const currentPage = getCurrentPage();

  const handleNavigation = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/trainer-mobile/payments');
        break;
      case 1:
        navigate('/trainer-mobile/stats');
        break;
      case 2:
        navigate('/trainer-mobile/schedule');
        break;
      case 3:
        navigate('/trainer-mobile/attendance');
        break;
      case 4:
        navigate('/trainer-mobile/profile');
        break;
    }
  };

  // Конфигурация кнопок нижнего меню
  const bottomNavItems = [
    {
      label: 'Платежи',
      icon: <PaymentIcon />,
      gradient: gradients.success,
    },
    {
      label: 'Статистика',
      icon: <StatsIcon />,
      gradient: gradients.warning,
    },
    {
      label: 'Расписание',
      icon: <ScheduleIcon />,
      gradient: gradients.info,
    },
    {
      label: 'Посещения',
      icon: <AttendanceIcon />,
      gradient: gradients.primary,
    },
    {
      label: 'Профиль',
      icon: <ProfileIcon />,
      gradient: gradients.info,
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: theme.palette.background.default,
    }}>
      {/* Основной контент */}
      <Box sx={{ 
        flex: 1, 
        pb: 10, // Увеличиваем отступ для нижнего меню
        pt: 'env(safe-area-inset-top)',
        px: 'env(safe-area-inset-left)',
      }}>
        {children}
      </Box>

      {/* Нижнее меню */}
      <Paper 
        elevation={8}
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: theme.palette.background.paper,
          borderTop: '1px solid',
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation
          value={currentPage}
          onChange={handleNavigation}
          sx={{
            background: 'transparent',
            minHeight: 72,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              color: theme.palette.text.secondary,
              padding: '8px 4px',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
                marginTop: 1,
                color: '#ffffff',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
              },
            },
          }}
        >
          {bottomNavItems.map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.label}
              showLabel={true}
              icon={item.icon}
              sx={{
                '&.Mui-selected .MuiSvgIcon-root': {
                  background: item.gradient,
                  borderRadius: '50%',
                  padding: '4px',
                  color: '#ffffff',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}; 