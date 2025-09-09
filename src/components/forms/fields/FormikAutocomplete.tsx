import { useField } from 'formik';
import { Autocomplete, TextField, AutocompleteProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { SyntheticEvent } from 'react';

export interface FormikAutocompleteProps<T> extends Omit<AutocompleteProps<T, false, false, false>, 'name' | 'value' | 'onChange' | 'renderInput'> {
  name: string;
  label: string;
  textFieldProps?: any;
  isLoading?: boolean; // Support both isLoading and loading
}

export function FormikAutocomplete<T>({ 
  name, 
  label,
  textFieldProps = {},
  isLoading = false,
  ...props 
}: FormikAutocompleteProps<T>) {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (
    _: SyntheticEvent<Element, Event>, 
    newValue: any
  ) => {
    helpers.setValue(newValue);
  };

  const hasError = meta.touched && Boolean(meta.error);

  return (
    <Autocomplete
      {...props}
      loading={isLoading}
      value={field.value || null}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label}
          error={hasError}
          helperText={hasError && meta.error}
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
            ...textFieldProps?.sx,
          }}
        />
      )}
    />
  );
}
