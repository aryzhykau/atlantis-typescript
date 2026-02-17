import React from 'react';
import { Box, Typography, Avatar, Button, IconButton, useTheme, alpha } from '@mui/material';
import { PersonAdd as PersonAddIcon, Delete as DeleteIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { AssignedStudentsProps, StudentTemplate } from './types';
import { getStartDateColorsAndStatus } from '../../../utils/studentStartDateHelper';

/**
 * AssignedStudents - Manages assigned students display and interaction
 * Single responsibility: Assigned students management with add/remove functionality
 */
const AssignedStudents: React.FC<AssignedStudentsProps> = ({
  event,
  localEvent,
  onStudentRemove,
  onToggleAddStudent,
  addingStudentOpen
}) => {
  const theme = useTheme();
  const typeColor = event.training_type?.color || theme.palette.primary.main;
  const assignedStudents = (localEvent?.raw?.assigned_students || event.raw?.assigned_students || []);

  if (!localEvent?.isTemplate && (!event.raw?.assigned_students || event.raw.assigned_students.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: theme.palette.text.secondary, 
            textTransform: 'uppercase', 
            letterSpacing: 0.5, 
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          Назначенные ученики ({assignedStudents.length})
        </Typography>
        {localEvent?.isTemplate && (
          <Button
            aria-label="Добавить ученика"
            onClick={onToggleAddStudent}
            disabled={Boolean(
              localEvent?.training_type?.max_participants && 
              (assignedStudents.length || 0) >= localEvent?.training_type?.max_participants
            )}
            startIcon={<PersonAddIcon fontSize="small" />}
            variant={addingStudentOpen ? "outlined" : "contained"}
            size="small"
            sx={{ 
              textTransform: 'none', 
              height: 36,
              borderRadius: 2,
              fontWeight: 600,
              minWidth: 'fit-content',
              px: 2,
              ...(addingStudentOpen ? {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                backgroundColor: 'transparent',
              } : {
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              })
            }}
          >
            {addingStudentOpen ? 'Скрыть' : 'Добавить'}
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {assignedStudents.slice(0, 5).map((studentTemplate: StudentTemplate, index: number) => (
          <Box 
            key={studentTemplate.id || index} 
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
              {studentTemplate.student?.first_name?.charAt(0) || '?'}
              {studentTemplate.student?.last_name?.charAt(0) || ''}
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
                {studentTemplate.student?.first_name || 'Имя'}{' '}
                {studentTemplate.student?.last_name || 'Фамилия'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontSize: '0.75rem',
                  backgroundColor: theme.palette.primary.main + '10',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 500,
                }}
              >
                В шаблоне
              </Typography>
              
              {/* Start Date with Color Coding and Status Text */}
              {(studentTemplate.start_date || studentTemplate.startDate) && (() => {
                const startDate = studentTemplate.start_date || studentTemplate.startDate || '';
                const { icon, text, statusText, formattedDate } = getStartDateColorsAndStatus(startDate, theme);
                
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon sx={{ 
                        fontSize: '0.75rem', 
                        mr: 0.5, 
                        color: alpha(icon, 0.6)
                      }} />
                      <Typography
                        variant="caption" 
                        sx={{ 
                          color: alpha(text, 0.8), 
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      >
                        Начало: {formattedDate}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: alpha(text, 0.8),
                        fontStyle: 'italic',
                        fontSize: '0.7rem'
                      }}
                    >
                      ({statusText})
                    </Typography>
                  </Box>
                );
              })()}
            </Box>
            
            <IconButton
              size="small"
              onClick={() => onStudentRemove(studentTemplate, event)}
              sx={{ 
                color: theme.palette.error.main, 
                backgroundColor: theme.palette.error.main + '10',
                width: 36,
                height: 36,
                '&:hover': { 
                  backgroundColor: theme.palette.error.main + '20',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
              aria-label="Удалить ученика"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        
        {assignedStudents.length > 5 && (
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
            И ещё {assignedStudents.length - 5} учеников...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AssignedStudents;
