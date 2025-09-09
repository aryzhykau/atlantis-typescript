import React from 'react';
import { useField } from 'formik';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface FormikNumberFieldProps extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText' | 'type'> {
  name: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export const FormikNumberField: React.FC<FormikNumberFieldProps> = ({ 
  name, 
  min,
  max,
  step = 1,
  prefix,
  suffix,
  decimalPlaces,
  ...props 
}) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Allow empty string for clearing the field
    if (value === '') {
      helpers.setValue('');
      return;
    }

    // Parse the number
    const numericValue = parseFloat(value);
    
    // Validate range if specified
    if (!isNaN(numericValue)) {
      let validatedValue = numericValue;
      
      if (min !== undefined && validatedValue < min) {
        validatedValue = min;
      }
      if (max !== undefined && validatedValue > max) {
        validatedValue = max;
      }
      
      // Apply decimal places if specified
      if (decimalPlaces !== undefined) {
        validatedValue = parseFloat(validatedValue.toFixed(decimalPlaces));
      }
      
      helpers.setValue(validatedValue);
    } else {
      // If it's not a valid number, don't update the field
      return;
    }
  };

  const startAdornment = prefix ? (
    <InputAdornment position="start">{prefix}</InputAdornment>
  ) : undefined;

  const endAdornment = suffix ? (
    <InputAdornment position="end">{suffix}</InputAdornment>
  ) : undefined;

  return (
    <TextField
      {...props}
      name={field.name}
      value={field.value ?? ''}
      onChange={handleChange}
      onBlur={field.onBlur}
      type="number"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      inputProps={{
        min,
        max,
        step,
        ...props.inputProps,
      }}
      InputProps={{
        startAdornment,
        endAdornment,
        ...props.InputProps,
      }}
      InputLabelProps={{
        shrink: true,
        ...props.InputLabelProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          },
        },
        '& .MuiFormHelperText-root': {
          marginLeft: 0,
          marginTop: 1,
        },
        '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '& input[type="number"]': {
          MozAppearance: 'textfield',
        },
        ...props.sx,
      }}
    />
  );
};
