import React, { useState, useRef } from 'react';
import { useField } from 'formik';
import { 
  Box, 
  Typography, 
  Portal, 
  Popper, 
  ClickAwayListener,
  FormHelperText,
  Paper,
  Grid
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';

export interface FormikColorPickerProps {
  name: string;
  label?: string;
}

// Comprehensive color palette suitable for both light and dark themes
const COLOR_PALETTE = [
  // Reds
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  // Oranges
  '#F97316', '#EA580C', '#C2410C', '#9A3412',
  // Yellows/Ambers
  '#F59E0B', '#D97706', '#B45309', '#92400E',
  // Greens
  '#10B981', '#059669', '#047857', '#065F46',
  // Teals
  '#14B8A6', '#0D9488', '#0F766E', '#115E59',
  // Cyans
  '#06B6D4', '#0891B2', '#0E7490', '#155E75',
  // Blues
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
  // Indigos
  '#6366F1', '#4F46E5', '#4338CA', '#3730A3',
  // Purples
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  // Pinks
  '#EC4899', '#DB2777', '#BE185D', '#9D174D',
  // Grays
  '#6B7280', '#4B5563', '#374151', '#1F2937',
  // Additional vibrant colors
  '#F43F5E', '#FB923C', '#FCD34D', '#34D399',
  '#22D3EE', '#60A5FA', '#A78BFA', '#F472B6',
];

export const FormikColorPicker: React.FC<FormikColorPickerProps> = ({
  name,
  label = 'Цвет'
}) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const colorIndicatorRef = useRef<HTMLDivElement>(null);

  const isOpen = Boolean(anchorEl);
  const hasError = meta.touched && !!meta.error;

  const handleColorIndicatorClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    helpers.setValue(color);
    setAnchorEl(null);
  };

  return (
    <Box>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          fontWeight: 500,
          color: hasError ? theme.palette.error.main : theme.palette.text.primary 
        }}
      >
        {label}
      </Typography>
      
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          ref={colorIndicatorRef}
          onClick={handleColorIndicatorClick}
          sx={{
            width: 48,
            height: 48,
            backgroundColor: field.value || '#3B82F6',
            borderRadius: 2,
            border: hasError 
              ? `2px solid ${theme.palette.error.main}` 
              : `2px solid ${theme.palette.divider}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: hasError 
                ? theme.palette.error.main 
                : theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(
                hasError ? theme.palette.error.main : theme.palette.primary.main, 
                0.1
              )}`,
            }
          }}
        />
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace', 
            color: theme.palette.text.secondary,
            textTransform: 'uppercase'
          }}
        >
          {field.value || '#3B82F6'}
        </Typography>
      </Box>

      {hasError && (
        <FormHelperText error sx={{ mt: 1 }}>
          {meta.error}
        </FormHelperText>
      )}

      {isOpen && (
        <Portal>
          <Popper
            open={isOpen}
            anchorEl={anchorEl}
            placement="bottom-start"
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
            ]}
            sx={{ zIndex: 1300 }}
          >
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  maxWidth: 320,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1.5, 
                    fontWeight: 600,
                    color: theme.palette.text.primary 
                  }}
                >
                  Выберите цвет
                </Typography>
                <Grid container spacing={1}>
                  {COLOR_PALETTE.map((color) => (
                    <Grid item key={color}>
                      <Box
                        onClick={() => handleColorSelect(color)}
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: color,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          border: field.value === color 
                            ? `3px solid ${theme.palette.primary.main}` 
                            : `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                          transition: 'all 0.15s ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&:hover': {
                            transform: 'scale(1.15)',
                            boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                            zIndex: 1,
                          },
                        }}
                      >
                        {field.value === color && (
                          <CheckIcon 
                            sx={{ 
                              color: '#fff',
                              fontSize: 20,
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                            }} 
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </ClickAwayListener>
          </Popper>
        </Portal>
      )}
    </Box>
  );
};
