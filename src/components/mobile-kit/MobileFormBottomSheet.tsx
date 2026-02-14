import { Box, SwipeableDrawer, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface MobileFormBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileFormBottomSheet({ open, onClose, title, children }: MobileFormBottomSheetProps) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableDiscovery={false}
      disableSwipeToOpen
    >
      <Box
        sx={{
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '88vh',
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
      </Box>
    </SwipeableDrawer>
  );
}