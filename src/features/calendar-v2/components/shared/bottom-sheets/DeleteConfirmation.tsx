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
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DeleteConfirmationProps } from './types';

/**
 * DeleteConfirmation - Bottom sheet confirmation for delete actions
 * Single responsibility: Delete confirmation bottom sheet modal
 */
const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
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
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 1500, // Higher than main bottom sheet
          background: theme.palette.background.paper,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.25)',
          backdropFilter: 'blur(8px)',
          maxHeight: '50vh',
        },
      }}
      ModalProps={{
        keepMounted: false,
      }}
    >
      {/* Handle bar for visual feedback */}
      <Box sx={{ 
        width: 48, 
        height: 4, 
        background: theme.palette.divider, 
        borderRadius: 2, 
        mx: 'auto', 
        mt: 2, 
        mb: 1,
        opacity: 0.6,
      }} />

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
              bgcolor: theme.palette.error.main + '15',
              width: 48,
              height: 48,
              color: theme.palette.error.main,
            }}>
              <WarningIcon fontSize="medium" />
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
                Подтвердить удаление
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Это действие нельзя отменить
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
          backgroundColor: theme.palette.error.main + '08',
          border: `1px solid ${theme.palette.error.main}20`,
          mb: 3,
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 500,
              textAlign: 'center',
              mb: 1,
            }}
          >
            {eventTitle 
              ? `Вы действительно хотите удалить "${eventTitle}"?` 
              : 'Вы действительно хотите удалить эту тренировку?'
            }
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            Вся информация о тренировке будет потеряна
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
            color="error" 
            onClick={onConfirm}
            startIcon={<DeleteIcon />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              }
            }}
          >
            Удалить тренировку
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default DeleteConfirmation;
