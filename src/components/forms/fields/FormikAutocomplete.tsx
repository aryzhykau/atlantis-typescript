import { useField } from 'formik';
import { 
  Autocomplete, 
  TextField, 
  AutocompleteProps, 
  TextFieldProps,
  Box 
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface FormikAutocompleteProps<T> 
  extends Omit<AutocompleteProps<T, false, false, false>, 'name' | 'value' | 'onChange' | 'renderInput'> {
  name: string;
  label: string;
  textFieldProps?: Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error'>;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
}

export const FormikAutocomplete = <T,>({ 
  name, 
  label,
  options = [],
  getOptionLabel,
  isOptionEqualToValue,
  renderOption,
  textFieldProps = {},
  isLoading = false,
  loadingText = "Загрузка...",
  emptyText = "Нет доступных опций",
  ...props 
}: FormikAutocompleteProps<T>) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);

  const handleChange = (_event: any, newValue: T | null) => {
    helpers.setValue(newValue);
    helpers.setTouched(true);
  };

  const hasError = meta.touched && Boolean(meta.error);

  const gradientStyle = {
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        {...props}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        renderOption={renderOption}
        value={field.value || null}
        onChange={handleChange}
        loading={isLoading}
        loadingText={loadingText}
        noOptionsText={emptyText}
        renderInput={(params) => (
          <TextField
            {...params}
            {...textFieldProps}
            label={label}
            error={hasError}
            helperText={hasError ? meta.error : undefined}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                background: gradientStyle.background,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 600,
              },
              ...textFieldProps.sx,
            }}
          />
        )}
      />
    </Box>
  );
};
