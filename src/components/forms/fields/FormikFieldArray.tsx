import React from 'react';
import { FieldArray, FieldArrayRenderProps } from 'formik';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useGradients } from '../../../features/trainer-mobile/hooks/useGradients';

export interface FormikFieldArrayProps {
  name: string;
  label?: string;
  addButtonText?: string;
  emptyItem?: any;
  children: (index: number, remove: (index: number) => void) => React.ReactNode;
}

export const FormikFieldArray: React.FC<FormikFieldArrayProps> = ({
  name,
  label,
  addButtonText = 'Добавить элемент',
  emptyItem = {},
  children,
}) => {
  const theme = useTheme();
  const gradients = useGradients();

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <Box>
          {label && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '1rem'
              }}
            >
              {label}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {arrayHelpers.form.values[name] && 
             arrayHelpers.form.values[name].length > 0 &&
             arrayHelpers.form.values[name].map((_: any, index: number) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  '&:not(:last-child)': {
                    mb: 1,
                    pb: 3,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }
                }}
              >
                <Box sx={{ pr: 5 }}>
                  {children(index, arrayHelpers.remove)}
                </Box>
                
                <IconButton
                  onClick={() => arrayHelpers.remove(index)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    color: theme.palette.text.disabled,
                    '&:hover': {
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => arrayHelpers.push(emptyItem)}
            sx={{
              mt: 3,
              background: gradients.primary,
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '0.95rem',
              boxShadow: 'none',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.9),
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {addButtonText}
          </Button>
        </Box>
      )}
    />
  );
};
