import React from 'react';
import { Grid, GridProps } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { StatsCard } from './StatsCard';

interface StatsItem {
  icon: SvgIconComponent;
  value: string | number;
  label: string;
  gradient?: 'primary' | 'success' | 'warning' | 'info';
}

interface StatsGridProps extends Omit<GridProps, 'container'> {
  items: StatsItem[];
  columns?: 2 | 3 | 4;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  items, 
  columns = 2, 
  sx = {},
  ...gridProps 
}) => {
  const getGridSize = () => {
    switch (columns) {
      case 2: return 6;
      case 3: return 4;
      case 4: return 3;
      default: return 6;
    }
  };

  return (
    <Grid 
      container 
      spacing={2} 
      sx={{ mb: 3, ...sx }}
      {...gridProps}
    >
      {items.map((item, index) => (
        <Grid item xs={getGridSize()} key={index}>
          <StatsCard
            icon={item.icon}
            value={item.value}
            label={item.label}
            gradient={item.gradient}
          />
        </Grid>
      ))}
    </Grid>
  );
}; 