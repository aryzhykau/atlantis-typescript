import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import { Logout, Menu } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const TrainerHeader: React.FC = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: theme.palette.background.paper,
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ 
          minHeight: 56,
          px: 2,
          pt: 'env(safe-area-inset-top)',
        }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
          >
            Atlantis Trainer
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={handleLogoutClick}
            sx={{ 
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.light + '20',
              }
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

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
    </>
  );
}; 