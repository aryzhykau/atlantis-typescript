import React from 'react';
import { useField } from 'formik';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { useTheme, alpha } from '@mui/material/styles';
import { Dayjs } from 'dayjs';

export interface FormikDatePickerProps extends Omit<DatePickerProps<Dayjs>, 'name' | 'value' | 'onChange'> {
  name: string;
}

export const FormikDatePicker: React.FC<FormikDatePickerProps> = ({ name, ...props }) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: Dayjs | null) => {
    helpers.setValue(value);
  };

  const hasError = meta.touched && Boolean(meta.error);

  return (
    <DatePicker
      {...props}
      value={field.value}
      onChange={handleChange}
      slotProps={{
        textField: {
          fullWidth: true,
          error: hasError,
          helperText: hasError ? meta.error : undefined,
          sx: {
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
          },
          ...props.slotProps?.textField,
        },
        ...props.slotProps,
      }}
    />
  );
};
