import React from 'react';
import { Box, Typography, Avatar, Chip, useTheme } from '@mui/material';
import { StudentListProps } from './types';

/**
 * StudentList - Reusable component for displaying student lists
 * Single responsibility: Student list display with consistent styling
 */
const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  typeColor, 
  title, 
  maxDisplay = 5 
}) => {
  const theme = useTheme();

  if (!students || students.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          color: theme.palette.text.secondary, 
          mb: 2, 
          textTransform: 'uppercase', 
          letterSpacing: 0.5, 
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {title} ({students.length})
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {students.slice(0, maxDisplay).map((student: any, index: number) => (
          <Box 
            key={student.id || index} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.primary.main + '40',
              }
            }}
          >
            <Avatar sx={{ 
              width: 40, 
              height: 40, 
              fontSize: '0.9rem', 
              backgroundColor: typeColor + '20', 
              color: typeColor, 
              fontWeight: 600,
              border: `2px solid ${typeColor}30`,
            }}>
              {student.student?.first_name?.charAt(0) || student.first_name?.charAt(0) || '?'}
              {student.student?.last_name?.charAt(0) || student.last_name?.charAt(0) || ''}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                {student.student?.first_name || student.first_name || 'Имя'}{' '}
                {student.student?.last_name || student.last_name || 'Фамилия'}
              </Typography>
              
              {student.status && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    fontSize: '0.75rem',
                    backgroundColor: theme.palette.info.main + '10',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                >
                  Статус: {student.status}
                </Typography>
              )}
            </Box>
            
            {student.requires_payment && (
              <Chip 
                label="Оплата" 
                size="small" 
                color="warning" 
                variant="filled" 
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 24,
                  fontWeight: 600,
                }} 
              />
            )}
          </Box>
        ))}
        
        {students.length > maxDisplay && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary, 
              textAlign: 'center', 
              fontStyle: 'italic',
              py: 1,
              fontSize: '0.8rem',
            }}
          >
            И ещё {students.length - maxDisplay} учеников...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default StudentList;
