import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

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
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box
        sx={{
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '78vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box sx={{ width: 44, height: 4, borderRadius: 999, backgroundColor: 'divider' }} />
        </Box>

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
