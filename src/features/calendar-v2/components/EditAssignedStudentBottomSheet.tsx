import { Box, SwipeableDrawer, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import { FormikAutocomplete } from '../../../components/forms/fields';

interface Props<T = any> {
  open: boolean;
  initialValue?: T | null;
  options: any[];
  label?: string;
  onClose: () => void; // should return to parent bottomsheet
  onSave: (value: any) => void;
  isLoading?: boolean;
}

export default function EditAssignedStudentBottomSheet({ open, initialValue = null, options, label = 'Клиент', onClose, onSave, isLoading = false }: Props) {
  const theme = useTheme();

  if (!open) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          p: 3,
          maxHeight: '70vh',
        },
      }}
    >
      <Box sx={{ width: 56, height: 6, background: theme.palette.primary.light, borderRadius: 3, mx: 'auto', mt: 1, mb: 2, opacity: 0.95 }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Изменить ученика</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Formik
          initialValues={{ student: initialValue || null }}
          onSubmit={(values) => {
            onSave(values.student);
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Box sx={{ mb: 2 }}>
                <FormikAutocomplete
                  name="student"
                  label={label}
                  options={options}
                  getOptionLabel={(opt: any) => opt?.label || `${opt.first_name || ''} ${opt.last_name || ''}`.trim()}
                  isLoading={isLoading}
                  textFieldProps={{ fullWidth: true }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" fullWidth disabled={isLoading}>Сохранить</Button>
                <Button variant="outlined" fullWidth onClick={onClose}>Отмена</Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </SwipeableDrawer>
  );
}
