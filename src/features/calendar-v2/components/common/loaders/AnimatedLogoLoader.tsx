import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  open: boolean;
  message?: string;
}

const AnimatedLogoLoader: React.FC<Props> = ({ open, message }) => {
  // Render directly based on `open` prop. Loader disappears when loading finishes.
  if (!open) return null;

  return (
    <Box
  component="div"
  aria-hidden={!open}
  aria-busy={open}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 20,
        backgroundColor: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto', // intercept all interactions
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'transparent',
          pointerEvents: 'none', // allow text selection to be blocked but keep overlay intercepting
        }}
      >
        {/* Static logo (square, center-cropped) */}
        {/* SquareCropImage: keeps a square size (min of width/height) and center-crops image */}
        {(() => {
          const SquareCropImage: React.FC<{ src: string; width?: number; height?: number }> = ({ src, width = 360, height = 50 }) => {
            const size = Math.max(width, height);
            return (
              <Box
                sx={{
                  width,
                  height,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* inner square crop centered inside outer box */}
                <Box
                  sx={{
                    width: size,
                    height: size,
                    overflow: 'hidden',
                    display: 'block',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt="logo"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: '50% 50%',
                      filter: 'drop-shadow(0 12px 36px rgba(0,0,0,0.45))',
                      display: 'block',
                    }}
                  />
                </Box>
              </Box>
            );
          };

          return <SquareCropImage src="/Logo.PNG" width={340} height={200} />;
        })()}

        {/* Dot wave loader between logo and message */}
        <Box sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`
            @keyframes dotWave {
              0% { transform: translateY(0px) scale(0.85); opacity: 0.6; }
              50% { transform: translateY(-12px) scale(1.2); opacity: 1; }
              100% { transform: translateY(0px) scale(0.85); opacity: 0.6; }
            }
          `}</style>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            {Array.from({ length: 5 }).map((_, index) => {
              const delay = index * 140;
              return (
                <Box
                  key={index}
                  sx={(theme) => ({
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    opacity: 0.6,
                    boxShadow: `0 0 12px ${theme.palette.primary.main}66`,
                    transformOrigin: 'center',
                    animation: `dotWave 1100ms ease-in-out ${delay}ms infinite`,
                  })}
                />
              );
            })}
          </Box>
        </Box>

        {message && (
          <Typography
            variant="body2"
            sx={{
              color: 'common.white',
              opacity: 0.95,
              fontWeight: 600,
              textAlign: 'center',
              textShadow: '0 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AnimatedLogoLoader;
