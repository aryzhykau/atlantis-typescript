import { Box, Button, Drawer, Stack, Typography } from '@mui/material';
import React from 'react';

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
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box
        sx={{
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '82vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box sx={{ width: 44, height: 4, borderRadius: 999, backgroundColor: 'divider' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>

        {children}

        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Button variant="contained" onClick={onSubmit}>
            {submitLabel}
          </Button>
          {onSubmitAndAddAnother && (
            <Button variant="outlined" onClick={onSubmitAndAddAnother}>
              {submitAnotherLabel}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
