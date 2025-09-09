import React from 'react';
import { Button, CircularProgress, useTheme, Box } from '@mui/material';

export interface FormActionsProps {
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitText = 'Сохранить',
  cancelText = 'Отмена',
  isLoading = false,
  isSubmitting = false,
  disabled = false,
  showCancel = true,
}) => {
  const theme = useTheme();

  // Success gradient from design system
  const successGradient = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

  const hoverGradient = theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
    : 'linear-gradient(135deg, #3f87fe 0%, #00d2fe 100%)';

  const isProcessing = isLoading || isSubmitting;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 4,
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      {showCancel && (
        <Button 
          onClick={onCancel} 
          disabled={isProcessing}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.2,
            minWidth: 100,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={disabled || isProcessing}
        sx={{ 
          background: successGradient,
          borderRadius: 2,
          py: 1.2,
          px: 4,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 120,
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
          '&:hover': {
            background: hoverGradient,
            boxShadow: theme.palette.mode === 'dark' ? 4 : 3,
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
            color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
          },
          transition: 'all 0.2s ease-in-out',
        }}
        startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {isProcessing ? 'Загрузка...' : submitText}
      </Button>
    </Box>
  );
};
