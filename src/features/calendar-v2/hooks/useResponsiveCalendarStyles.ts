/**
 * Custom hook for responsive calendar styles
 */

import { useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export interface ResponsiveCalendarStyles {
  gridTemplateColumns: string;
  timeColumnWidth: string;
  fontSize: string;
  slotHeight: string;
  cardPadding: string;
  isMobile: boolean;
  isTablet: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Hook for managing responsive calendar styles with theme breakpoints
 */
export const useResponsiveCalendarStyles = (): ResponsiveCalendarStyles => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const responsiveStyles = useMemo((): ResponsiveCalendarStyles => {
    let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    let gridTemplateColumns: string;
    let timeColumnWidth: string;
    let fontSize: string;
    let slotHeight: string;
    let cardPadding: string;

    if (isMobile) {
      breakpoint = 'mobile';
      timeColumnWidth = '50px';
      gridTemplateColumns = '50px repeat(7, 1fr)';
      fontSize = '0.7rem';
      slotHeight = '90px';
      cardPadding = '4px';
    } else if (isTablet) {
      breakpoint = 'tablet';
      timeColumnWidth = '70px';
      gridTemplateColumns = '70px repeat(7, 1fr)';
      fontSize = '0.8rem';
      slotHeight = '120px';
      cardPadding = '6px';
    } else {
      breakpoint = 'desktop';
      timeColumnWidth = '90px';
      gridTemplateColumns = '90px repeat(7, 1fr)';
      fontSize = '0.9rem';
      slotHeight = '130px';
      cardPadding = '8px';
    }

    return {
      gridTemplateColumns,
      timeColumnWidth,
      fontSize,
      slotHeight,
      cardPadding,
      isMobile,
      isTablet,
      breakpoint,
    };
  }, [isMobile, isTablet]);

  return responsiveStyles;
};

/**
 * Hook for calendar-specific responsive values with Material-UI sx prop format
 */
export const useCalendarResponsiveProps = () => {
  const theme = useTheme();
  
  return useMemo(() => ({
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '60px repeat(7, minmax(80px, 1fr))',
        md: '80px repeat(7, minmax(100px, 1fr))',
        lg: '100px repeat(7, minmax(140px, 1fr))',
      },
      gap: theme.spacing(0.5),
    },
    slotHeight: {
      xs: '80px',
      md: '100px',
      lg: '110px',
    },
    fontSize: {
      main: {
        xs: '0.6rem',
        md: '0.65rem',
        lg: '0.75rem',
      },
      secondary: {
        xs: '0.5rem',
        md: '0.6rem',
        lg: '0.65rem',
      },
    },
    cardPadding: {
      xs: 0.25,
      md: 0.5,
      lg: 0.75,
    },
  }), [theme]);
};
