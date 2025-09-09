import React from 'react';
import { useField } from 'formik';
import { FormControlLabel, Checkbox, CheckboxProps, FormControlLabelProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface FormikCheckboxFieldProps extends Omit<CheckboxProps, 'name' | 'checked' | 'onChange'> {
  name: string;
  label: string;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
}

export const FormikCheckboxField: React.FC<FormikCheckboxFieldProps> = ({ 
  name, 
  label, 
  labelProps,
  ...checkboxProps 
}) => {
  const theme = useTheme();
  const [field, , helpers] = useField({ name, type: 'checkbox' });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.checked);
  };

  return (
    <FormControlLabel
      {...labelProps}
      control={
        <Checkbox
          {...field}
          {...checkboxProps}
          checked={field.value || false}
          onChange={handleChange}
          color="primary"
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '&.Mui-checked': {
              color: theme.palette.primary.main,
            },
            '& .MuiSvgIcon-root': {
              borderRadius: 1,
            },
            ...checkboxProps.sx,
          }}
        />
      }
      label={label}
      sx={{
        display: 'block',
        '& .MuiFormControlLabel-label': {
          fontSize: '1rem',
          color: theme.palette.text.primary,
        },
        ...labelProps?.sx,
      }}
    />
  );
};
