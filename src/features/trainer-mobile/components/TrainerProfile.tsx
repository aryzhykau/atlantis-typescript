import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email,
  Phone,
  Edit,
  Logout,
  Settings,
  Notifications,
  Security,
} from '@mui/icons-material';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { useGradients } from '../hooks/useGradients';
import { useAuth } from '../../../hooks/useAuth';

export const TrainerProfile: React.FC = () => {
  const theme = useTheme();
  const gradients = useGradients();
  const { doLogout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Получаем текущего пользователя (тренера)
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  if (isLoadingUser) {
    return (
      <Box sx={{ 
        p: 2, 
        pb: 10, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        background: gradients.info,
        borderRadius: 3,
        mx: 1,
      }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Загрузка профиля...
        </Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    doLogout();
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <Box sx={{ 
      p: 2, 
      pb: 10,
      background: theme.palette.background.default, 
      minHeight: '100%',
    }}>
      {/* Профиль тренера */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 3, 
          background: gradients.primary,
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              background: 'rgba(255,255,255,0.2)',
              fontSize: '2rem',
              fontWeight: 600,
            }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Тренер по плаванию
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ 
              mt: 2, 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Редактировать профиль
          </Button>
        </Box>
      </Paper>

      {/* Контактная информация */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ 
          p: 2, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Контактная информация
          </Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemIcon>
              <Email sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Email" 
              secondary={user?.email || 'Не указан'}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Phone sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Телефон" 
              secondary={`+${user?.phone_country_code} ${user?.phone_number}` || 'Не указан'}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Настройки */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ 
          p: 2, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Настройки
          </Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemIcon>
              <Notifications sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText primary="Уведомления" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Security sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText primary="Безопасность" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Settings sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText primary="Общие настройки" />
          </ListItem>
        </List>
      </Paper>

      {/* Выход */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: theme.palette.background.paper,
        }}
      >
        <List>
          <ListItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout sx={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Выйти из аккаунта" 
              primaryTypographyProps={{ color: theme.palette.error.main }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Диалог подтверждения логаута */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Выйти из системы?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Вы уверены, что хотите выйти из системы? Все несохраненные данные будут потеряны.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleLogoutCancel} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Выйти
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 