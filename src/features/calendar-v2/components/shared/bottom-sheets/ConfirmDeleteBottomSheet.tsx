import { SwipeableDrawer, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirming?: boolean;
}

export default function ConfirmDeleteBottomSheet({ open, title = 'Подтвердите удаление', message = 'Вы уверены, что хотите удалить этого ученика из шаблона?', onConfirm, onClose, confirming = false }: Props) {
  const theme = useTheme();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{ sx: { borderTopLeftRadius: 28, borderTopRightRadius: 28, p: 3 } }}
    >
      <Box sx={{ width: 56, height: 6, background: theme.palette.primary.light, borderRadius: 3, mx: 'auto', mt: 1, mb: 2, opacity: 0.95 }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Typography sx={{ mb: 3, color: theme.palette.text.secondary }}>{message}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="error" onClick={onConfirm} disabled={confirming} fullWidth>Удалить</Button>
          <Button variant="outlined" onClick={onClose} fullWidth>Отмена</Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
