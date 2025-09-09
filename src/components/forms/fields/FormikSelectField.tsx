import React from 'react';
import { useField } from 'formik';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface FormikSelectFieldProps extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: string;
  label: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
}

export const FormikSelectField: React.FC<FormikSelectFieldProps> = ({ 
  name, 
  label, 
  children, 
  isLoading = false,
  loadingText = "Загрузка...",
  emptyText = "Нет доступных опций",
  ...props 
}) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (event: any) => {
    helpers.setValue(event.target.value);
  };

  const hasError = meta.touched && Boolean(meta.error);

  const { sx: formControlSx, ...restProps } = props;
  
  return (
    <FormControl fullWidth error={hasError} sx={formControlSx}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        {...field}
        {...restProps}
        labelId={`${name}-label`}
        label={label}
        value={field.value || ''}
        onChange={handleChange}
        disabled={isLoading || restProps.disabled}
        sx={{
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
        }}
      >
        {isLoading ? (
          <MenuItem value="" disabled>
            <em>{loadingText}</em>
          </MenuItem>
        ) : React.Children.count(children) === 0 ? (
          <MenuItem value="" disabled>
            <em>{emptyText}</em>
          </MenuItem>
        ) : (
          children
        )}
      </Select>
      {hasError && (
        <FormHelperText sx={{ marginLeft: 0, marginTop: 1 }}>
          {meta.error}
        </FormHelperText>
      )}
    </FormControl>
  );
};
