import React from 'react';
import { useField } from 'formik';
import { FormControlLabel, Switch, SwitchProps, FormControlLabelProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface FormikSwitchProps extends Omit<SwitchProps, 'name' | 'checked' | 'onChange'> {
  name: string;
  label: string;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
}

export const FormikSwitch: React.FC<FormikSwitchProps> = ({ 
  name, 
  label, 
  labelProps,
  ...switchProps 
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
        <Switch
          {...field}
          {...switchProps}
          checked={field.value || false}
          onChange={handleChange}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: theme.palette.primary.main,
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main,
            },
            ...switchProps.sx,
          }}
        />
      }
      label={label}
      sx={{
        display: 'block',
        '& .MuiFormControlLabel-label': {
          fontSize: '1rem',
          color: theme.palette.text.primary,
          fontWeight: 500,
        },
        ...labelProps?.sx,
      }}
    />
  );
};
