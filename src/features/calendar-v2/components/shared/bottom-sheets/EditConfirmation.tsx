import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  SwipeableDrawer,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { BottomSheetHandle, getBottomSheetPaperSx } from './bottomSheetStyles';

interface EditConfirmationProps {
  show: boolean;
  eventTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * EditConfirmation - Bottom sheet confirmation for edit actions
 * Single responsibility: Edit confirmation bottom sheet modal
 */
const EditConfirmation: React.FC<EditConfirmationProps> = ({
  show,
  eventTitle,
  onConfirm,
  onCancel
}) => {
  const theme = useTheme();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={show}
      onClose={onCancel}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          zIndex: 1500, // Higher than main bottom sheet
          maxHeight: '50vh',
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
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 3 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
          }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main + '15',
              width: 48,
              height: 48,
              color: theme.palette.primary.main,
            }}>
              <EditIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                Редактировать тренировку
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Откроется форма редактирования
              </Typography>
            </Box>
          </Box>

          <IconButton 
            onClick={onCancel}
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

        {/* Content */}
        <Box sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.primary.main + '08',
          border: `1px solid ${theme.palette.primary.main}20`,
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <InfoIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {eventTitle 
                ? `Редактировать "${eventTitle}"?` 
                : 'Редактировать эту тренировку?'
              }
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              ml: 4,
            }}
          >
            Вы сможете изменить время, тренера, тип тренировки и другие параметры
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          '& > button': {
            minHeight: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }
        }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{ 
              flex: 1,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={onConfirm}
            startIcon={<EditIcon />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            Открыть редактор
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default EditConfirmation;
