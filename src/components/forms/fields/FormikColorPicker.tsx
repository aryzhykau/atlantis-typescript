import React, { useState, useRef } from 'react';
import { useField } from 'formik';
import { 
  Box, 
  Typography, 
  Portal, 
  Popper, 
  ClickAwayListener,
  FormHelperText
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ColorResult, ChromePicker } from 'react-color';

export interface FormikColorPickerProps {
  name: string;
  label?: string;
}

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

  const handleColorChange = (newColor: ColorResult) => {
    helpers.setValue(newColor.hex);
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
            backgroundColor: field.value || '#000000',
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
          {field.value || '#000000'}
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
              <ChromePicker
                color={field.value || '#000000'}
                onChange={handleColorChange}
                disableAlpha={true}
                styles={{
                  default: {
                    picker: {
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      borderRadius: '12px',
                      background: '#fff'
                    }
                  }
                }}
              />
            </ClickAwayListener>
          </Popper>
        </Portal>
      )}
    </Box>
  );
};
