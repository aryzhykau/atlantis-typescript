import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Collapse } from '@mui/material';
import { FitnessCenter, AccessTime, Group, ExpandMore } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { StudentAttendanceItem } from './StudentAttendanceItem';
import { TrainerTraining } from '../models';

interface TrainingCardProps {
  training: TrainerTraining;
  canMark: boolean;
  isUpdating: boolean;
  onMarkAbsent: (trainingId: number, studentId: number) => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({
  training,
  canMark,
  isUpdating,
  onMarkAbsent,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // "HH:MM"
  };

  const getStudentCount = (training: TrainerTraining) => {
    return training.students?.filter((s: any) => 
      !['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(s.status)
    ).length || 0;
  };

  const hasStudents = training.students && training.students.length > 0;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 3, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background: theme.palette.background.paper,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        }
      }}
    >
      {/* Заголовок карточки */}
      <Box sx={{ 
        p: 2, 
        background: alpha(theme.palette.primary.main, 0.05),
        borderBottom: hasStudents ? '1px solid' : 'none',
        borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FitnessCenter sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
                {training.training_type?.name || 'Тренировка'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatTime(training.start_time)}
                </Typography>
                {hasStudents && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                      •
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getStudentCount(training)} учеников
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<Group />}
              label={`${getStudentCount(training)} учеников`}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: training.training_type?.color || theme.palette.primary.main,
                color: training.training_type?.color || theme.palette.primary.main,
                borderRadius: 2,
                fontWeight: 500,
              }}
            />
            
            {hasStudents && (
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                  color: theme.palette.primary.main,
                  transition: 'all 0.2s ease-in-out',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                    transform: isExpanded ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)',
                  }
                }}
                title={isExpanded ? 'Скрыть учеников' : 'Показать учеников'}
              >
                <ExpandMore />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Раскрывающийся список учеников */}
      {hasStudents && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 3, pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.text.primary }}>
              Ученики:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {training.students.map((studentTraining: any) => (
                <StudentAttendanceItem
                  key={studentTraining.student_id}
                  studentTraining={studentTraining}
                  trainingId={training.id}
                  trainingDate={training.training_date}
                  canMark={canMark}
                  isUpdating={isUpdating}
                  onMarkAbsent={onMarkAbsent}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}; 