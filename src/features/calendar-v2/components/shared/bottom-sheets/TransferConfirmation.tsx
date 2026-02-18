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
  AccessTime as TimeIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { BottomSheetHandle, getBottomSheetPaperSx } from './bottomSheetStyles';

interface TransferConfirmationProps {
  show: boolean;
  eventTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * TransferConfirmation - Bottom sheet confirmation for transfer actions
 * Single responsibility: Transfer confirmation bottom sheet modal
 */
const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
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
              bgcolor: theme.palette.secondary.main + '15',
              width: 48,
              height: 48,
              color: theme.palette.secondary.main,
            }}>
              <TimeIcon fontSize="medium" />
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
                Перенести тренировку
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Выберите новое время и дату
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
          backgroundColor: theme.palette.secondary.main + '08',
          border: `1px solid ${theme.palette.secondary.main}20`,
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SwapIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.2rem' }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {eventTitle 
                ? `Перенести "${eventTitle}"?` 
                : 'Перенести эту тренировку?'
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
            Откроется календарь для выбора нового времени и даты проведения
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
            startIcon={<TimeIcon />}
            sx={{ 
              flex: 1,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: theme.palette.getContrastText(theme.palette.secondary.main),
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Выбрать время
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default TransferConfirmation;
