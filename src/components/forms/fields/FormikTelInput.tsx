import React from 'react';
import { useField } from 'formik';
import { MuiTelInput, MuiTelInputProps } from 'mui-tel-input';
import { useTheme, alpha } from '@mui/material/styles';

export type FormikTelInputProps = MuiTelInputProps & {
  name: string;
};

export const FormikTelInput: React.FC<FormikTelInputProps> = ({ name, ...props }) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (newValue: string) => {
    helpers.setValue(newValue);
  };

  return (
    <MuiTelInput
      {...props}
      disableFormatting={false}
      value={field.value || ''}
      onChange={handleChange}
      onBlur={field.onBlur}
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
