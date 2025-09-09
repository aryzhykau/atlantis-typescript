import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  useTheme,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface FormikDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const FormikDialog: React.FC<FormikDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'sm',
  children,
  actions,
}) => {
  const theme = useTheme();

  // Dynamic gradient based on theme mode
  const gradient = theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: 3,
          overflow: 'hidden',
        } 
      }}
    >
      {/* Gradient Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          background: gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: subtitle ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {icon && (
                <Box sx={{ mr: 1, fontSize: 32, display: 'flex', alignItems: 'center' }}>
                  {icon}
                </Box>
              )}
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ 
                color: 'white',
                ml: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {subtitle && (
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Content */}
      <DialogContent sx={{ p: 3, pt: 3 }}>
        {children}
      </DialogContent>

      {/* Actions */}
      {actions && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
