import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
  SwipeableDrawer,
  IconButton
} from '@mui/material';
import { 
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { BottomSheetHandle, getBottomSheetPaperSx } from './bottomSheetStyles';

interface EditBottomSheetProps {
  event: NormalizedEvent | null;
  open: boolean;
  onSave: (event: NormalizedEvent, updates: Partial<NormalizedEvent>) => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * EditBottomSheet - Separate bottom sheet for editing events
 * Single responsibility: Event editing in a dedicated bottom sheet above main sheet
 */
const EditBottomSheet: React.FC<EditBottomSheetProps> = ({
  event,
  open,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const theme = useTheme();
  
  const [editedTitle, setEditedTitle] = useState(event?.title || '');
  
  // Update local state when event changes
  React.useEffect(() => {
    if (event) {
      setEditedTitle(event.title || '');
    }
  }, [event]);

  const handleSave = useCallback(() => {
    if (!event) return;
    const updates = {
      title: editedTitle,
    };
    onSave(event, updates);
  }, [event, editedTitle, onSave]);

  const hasChanges = event && editedTitle !== (event.title || '');

  if (!event) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          zIndex: 1600, // Higher than main bottom sheet (1500)
          maxHeight: '80vh',
        }),
      }}
      ModalProps={{
        keepMounted: false,
      }}
    >
      {/* Handle bar for visual feedback */}
      <BottomSheetHandle />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              backgroundColor: theme.palette.primary.main + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EditIcon sx={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 0.5,
              }}>
                Редактировать тренировку
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}>
                Измените детали тренировки
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': { 
                backgroundColor: theme.palette.action.hover 
              },
              width: 44,
              height: 44,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Current Event Info */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: theme.palette.action.hover,
          borderRadius: 2,
          mb: 3,
        }}>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary, 
            mb: 1,
            fontWeight: 500,
          }}>
            Текущая тренировка:
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            color: theme.palette.text.primary,
          }}>
            {event.title}
          </Typography>
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Название тренировки"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            variant="outlined"
            fullWidth
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          {/* Info Alert */}
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem',
              }
            }}
          >
            Для изменения времени, тренера или типа тренировки используйте расширенный редактор
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            mt: 2,
          }}>
            <Button 
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckIcon />
                )
              }
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                }
              }}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Box>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default EditBottomSheet;
