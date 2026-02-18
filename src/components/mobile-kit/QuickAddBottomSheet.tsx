import { Box, Button, Stack, SwipeableDrawer, Typography, useTheme } from '@mui/material';
import React from 'react';
import { BottomSheetHandle, getBottomSheetPaperSx } from '../../features/calendar-v2/components/shared/bottom-sheets/bottomSheetStyles';

interface QuickAddBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  onSubmitAndAddAnother?: () => void;
  submitLabel?: string;
  submitAnotherLabel?: string;
  children: React.ReactNode;
}

export function QuickAddBottomSheet({
  open,
  title,
  onClose,
  onSubmit,
  onSubmitAndAddAnother,
  submitLabel = 'Сохранить',
  submitAnotherLabel = 'Сохранить и добавить ещё',
  children,
}: QuickAddBottomSheetProps) {
  const theme = useTheme();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          maxHeight: '82vh',
          overflow: 'hidden',
        }),
      }}
    >
      <BottomSheetHandle />
      <Box
        sx={{
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>

        {children}

        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            onClick={onSubmit}
            sx={{
              background: 'linear-gradient(135deg, #7C4DFF 0%, #5E35B1 100%)',
              color: 'white',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #7346f2 0%, #512da8 100%)',
              },
            }}
          >
            {submitLabel}
          </Button>
          {onSubmitAndAddAnother && (
            <Button
              variant="contained"
              onClick={onSubmitAndAddAnother}
              sx={{
                background: 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)',
                color: 'white',
                fontWeight: 700,
                '&:hover': {
                  background: 'linear-gradient(135deg, #23998e 0%, #00796b 100%)',
                },
              }}
            >
              {submitAnotherLabel}
            </Button>
          )}
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
}
