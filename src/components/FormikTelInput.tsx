import { useField } from 'formik';
import { MuiTelInput, MuiTelInputProps } from 'mui-tel-input';

type FormikTelInputProps = MuiTelInputProps & {
  name: string;
};

export function FormikTelInput(props: FormikTelInputProps) {
  const [field, meta, helpers] = useField(props.name);

  const { setValue } = helpers;

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  return (
    <MuiTelInput
      {...props}
      value={field.value || ''}
      onChange={handleChange}
      onBlur={field.onBlur}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
    />
  );
} 