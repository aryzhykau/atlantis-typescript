import React from 'react';
import { useField } from 'formik';
import { TextField, TextFieldProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface FormikTextFieldProps extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText'> {
  name: string;
}

export const FormikTextField: React.FC<FormikTextFieldProps> = ({ name, ...props }) => {
  const theme = useTheme();
  const [field, meta] = useField(name);

  return (
    <TextField
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
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
        ...props.sx,
      }}
    />
  );
};
