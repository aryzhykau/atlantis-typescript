import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

interface SpringLoaderProps {
  size?: number;
}

export const SpringLoader: React.FC<SpringLoaderProps> = ({ 
  size = 300
}) => {
  const theme = useTheme();

  // Main logo entrance and breathing animation
  const logoAnimation = useSpring({
    from: { 
      transform: 'scale(0) rotate(0deg)',
      opacity: 0,
    },
    to: async (next) => {
      // Dramatic entrance
      await next({
        transform: 'scale(1) rotate(360deg)',
        opacity: 1,
        config: { 
          tension: 200,
          friction: 20,
          mass: 1.5
        }
      });
      
      // Gentle breathing pulse
      while (true) {
        await next({
          transform: 'scale(1.08) rotate(360deg)',
          config: { tension: 100, friction: 10 }
        });
        await next({
          transform: 'scale(1) rotate(360deg)',
          config: { tension: 100, friction: 10 }
        });
      }
    }
  });

  // Floating glow orbs around logo
  const orb1 = useSpring({
    from: { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
    to: { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
    loop: true,
    config: { duration: 4000 }
  });

  const orb2 = useSpring({
    from: { transform: 'rotate(120deg) translateX(100px) rotate(-120deg)' },
    to: { transform: 'rotate(480deg) translateX(100px) rotate(-480deg)' },
    loop: true,
    config: { duration: 5000 }
  });

  const orb3 = useSpring({
    from: { transform: 'rotate(240deg) translateX(60px) rotate(-240deg)' },
    to: { transform: 'rotate(600deg) translateX(60px) rotate(-600deg)' },
    loop: true,
    config: { duration: 3500 }
  });

  // Background shimmer effect
  const shimmer = useSpring({
    from: { backgroundPosition: '-200% center' },
    to: { backgroundPosition: '200% center' },
    loop: true,
    config: { duration: 3000 }
  });

  return (
    <animated.div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
        ...shimmer
      }}
    >
      {/* Animated background shimmer overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 4s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% center' },
            '100%': { backgroundPosition: '200% center' }
          }
        }}
      />

      {/* Floating particles */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.6)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::before': {
            top: '20%',
            left: '10%',
            animationDelay: '0s',
          },
          '&::after': {
            top: '70%',
            right: '15%',
            animationDelay: '3s',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }}
      />
      
      {/* Main logo container with orbital elements */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Orbital container for floating orbs */}
        <Box
          sx={{
            position: 'relative',
            width: size + 200,
            height: size + 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Floating orb 1 */}
          <animated.div
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
              boxShadow: '0 0 20px rgba(255, 107, 107, 0.6)',
              ...orb1
            }}
          />
          
          {/* Floating orb 2 */}
          <animated.div
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #48cae4, #023e8a)',
              boxShadow: '0 0 15px rgba(72, 202, 228, 0.6)',
              ...orb2
            }}
          />
          
          {/* Floating orb 3 */}
          <animated.div
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #9d4edd, #c77dff)',
              boxShadow: '0 0 25px rgba(157, 78, 221, 0.6)',
              ...orb3
            }}
          />

          {/* Main logo with gorgeous effects */}
          <animated.div
            style={{
              position: 'relative',
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.2)'} 0%, transparent 70%)`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 0 60px rgba(102, 126, 234, 0.3), inset 0 0 30px rgba(255,255,255,0.05)'
                : '0 0 60px rgba(118, 75, 162, 0.4), inset 0 0 30px rgba(255,255,255,0.3)',
              ...logoAnimation,
            }}
          >
            {/* Logo image */}
            <animated.img
              src="/Logo.PNG"
              alt="Atlantis Logo"
              style={{
                width: '85%',
                height: '85%',
                objectFit: 'contain',
                filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                position: 'relative',
                zIndex: 2,
              }}
            />
          </animated.div>
        </Box>
        
        {/* Elegant loading dots with wave effect */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            mt: 6,
          }}
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const dotAnimation = useSpring({
              from: { 
                transform: 'translateY(0px) scale(0.8)',
                opacity: 0.4,
              },
              to: async (next) => {
                while (true) {
                  await new Promise(resolve => setTimeout(resolve, index * 150));
                  await next({ 
                    transform: 'translateY(-15px) scale(1.2)', 
                    opacity: 1,
                    config: { 
                      tension: 400,
                      friction: 8,
                    }
                  });
                  await next({ 
                    transform: 'translateY(0px) scale(0.8)', 
                    opacity: 0.4,
                    config: { 
                      tension: 200,
                      friction: 20,
                    }
                  });
                  if (index === 4) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                  }
                }
              },
            });

            return (
              <animated.div
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${
                    theme.palette.mode === 'dark' 
                      ? '#667eea, #764ba2' 
                      : '#f093fb, #f5576c'
                  })`,
                  boxShadow: `0 0 15px ${
                    theme.palette.mode === 'dark' 
                      ? 'rgba(102, 126, 234, 0.6)' 
                      : 'rgba(245, 87, 108, 0.6)'
                  }`,
                  ...dotAnimation,
                }}
              />
            );
          })}
        </Box>
      </Box>
    </animated.div>
  );
};
