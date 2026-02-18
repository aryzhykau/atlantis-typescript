import { Box, SwipeableDrawer, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { BottomSheetHandle, getBottomSheetPaperSx } from '../../features/calendar-v2/components/shared/bottom-sheets/bottomSheetStyles';

interface MobileFormBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileFormBottomSheet({ open, onClose, title, children }: MobileFormBottomSheetProps) {
  const theme = useTheme();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableDiscovery={false}
      disableSwipeToOpen
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          maxHeight: '88vh',
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
      </Box>
    </SwipeableDrawer>
  );
}