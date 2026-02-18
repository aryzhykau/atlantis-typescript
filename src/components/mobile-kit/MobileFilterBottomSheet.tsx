import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { BottomSheetHandle, getBottomSheetPaperSx } from '../../features/calendar-v2/components/shared/bottom-sheets/bottomSheetStyles';

interface MobileFilterBottomSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onApply?: () => void;
  onReset?: () => void;
  children: React.ReactNode;
}

export function MobileFilterBottomSheet({
  open,
  title = 'Фильтры',
  onClose,
  onApply,
  onReset,
  children,
}: MobileFilterBottomSheetProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          maxHeight: '78vh',
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
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {children}

        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
          {onReset && (
            <Button variant="outlined" fullWidth onClick={onReset}>
              Сбросить
            </Button>
          )}
          <Button variant="contained" fullWidth onClick={onApply ?? onClose}>
            Применить
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
