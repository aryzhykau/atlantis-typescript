import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  SwipeableDrawer,
  Autocomplete,
  TextField,
  Button,
  useTheme,
  IconButton,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { useAddStudentToRealTrainingMutation } from '../../../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { useSnackbar } from '../../../../../hooks/useSnackBar';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface AddStudentToRealTrainingBottomSheetProps {
  open: boolean;
  training: NormalizedEvent;
  onClose: () => void;
}

/**
 * AddStudentToRealTrainingBottomSheet - Add student to real training
 */
const AddStudentToRealTrainingBottomSheet: React.FC<AddStudentToRealTrainingBottomSheetProps> = ({
  open,
  training,
  onClose,
}) => {
  const theme = useTheme();
  const { displaySnackbar } = useSnackbar();
  
  const [addStudentToTraining, { isLoading }] = useAddStudentToRealTrainingMutation();
  const { data: allStudents } = useGetStudentsQuery();
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get available students (not already in training and active)
  const availableStudents = useMemo(() => {
    if (!allStudents || !training.raw?.students) {
      return allStudents?.filter(s => s.is_active) || [];
    }
    
    const currentStudentIds = new Set(
      training.raw.students
        .filter((s: any) => s.status !== 'CANCELLED_SAFE' && s.status !== 'CANCELLED_PENALTY')
        .map((s: any) => s.student_id || s.student?.id)
        .filter(Boolean)
    );
    
    return allStudents.filter(student => 
      student.is_active && !currentStudentIds.has(student.id)
    );
  }, [allStudents, training.raw?.students]);

  // Check capacity
  const capacityInfo = useMemo(() => {
    const activeStudents = training.raw?.students?.filter((s: any) => 
      s.status !== 'CANCELLED_SAFE' && s.status !== 'CANCELLED_PENALTY'
    ) || [];
    
    const current = activeStudents.length;
    const max = training.training_type?.max_participants || null;
    
    return {
      current,
      max,
      hasLimit: max !== null,
      isFull: max ? current >= max : false,
      available: max ? max - current : null
    };
  }, [training.raw?.students, training.training_type?.max_participants]);

  const handleAddStudent = useCallback(async () => {
    if (!selectedStudent || !training) return;
    
      try {
      await addStudentToTraining({
        training_id: training.id,
        student_id: selectedStudent.id,
        is_trial: false,
      }).unwrap();
      
      displaySnackbar(`Ученик ${selectedStudent.first_name} ${selectedStudent.last_name} добавлен на тренировку`, 'success');
      setSelectedStudent(null);
      onClose();
    } catch (err: any) {
      console.error('[AddStudentToRealTrainingBottomSheet] Failed to add student:', err);
      displaySnackbar(
        err?.data?.detail || 'Ошибка при добавлении ученика', 
        'error'
      );
    }
  }, [selectedStudent, training, addStudentToTraining, displaySnackbar, onClose]);

  const handleClose = useCallback(() => {
    setSelectedStudent(null);
    onClose();
  }, [onClose]);

  if (!training) return null;

  const typeColor = training.training_type?.color || theme.palette.primary.main;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 1500,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
          backdropFilter: 'blur(8px)',
          maxHeight: '85vh',
        },
      }}
    >
      {/* Handle bar */}
      <Box sx={{ 
        width: 48, 
        height: 4, 
        background: theme.palette.divider, 
        borderRadius: 2, 
        mx: 'auto', 
        mt: 2, 
        mb: 1,
        opacity: 0.6,
      }} />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
              Добавить ученика
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {training.title} • {training.raw?.training_date && dayjs(training.raw.training_date).format('D MMMM YYYY')}
            </Typography>
          </Box>

          <IconButton 
            onClick={handleClose} 
            sx={{ 
              color: theme.palette.text.secondary, 
              '&:hover': { backgroundColor: theme.palette.action.hover },
              width: 44,
              height: 44,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Capacity Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3 
        }}>
          <Avatar sx={{ 
            bgcolor: typeColor, 
            width: 48, 
            height: 48, 
            fontSize: '1.1rem', 
            fontWeight: 600 
          }}>
            <PersonAddIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Вместимость
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {(() => {
                let statusText = `${capacityInfo.current}`;
                if (capacityInfo.hasLimit) {
                  statusText += `/${capacityInfo.max}`;
                }
                statusText += ' записано';
                
                if (capacityInfo.available !== null) {
                  statusText += `, свободно: ${capacityInfo.available}`;
                }
                
                return statusText;
              })()}
            </Typography>
          </Box>
        </Box>

        {/* Warning if full */}
        {capacityInfo.isFull && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Тренировка заполнена. Нельзя добавить больше учеников.
          </Alert>
        )}

        {/* Warning if no students available */}
        {availableStudents.length === 0 && !capacityInfo.isFull && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Все активные ученики уже записаны на эту тренировку.
          </Alert>
        )}

        {/* Student Selection */}
        {availableStudents.length > 0 && !capacityInfo.isFull && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary, 
              mb: 2,
              fontWeight: 500,
            }}>
              Выберите ученика ({availableStudents.length} доступно)
            </Typography>
            
            <Autocomplete
              options={availableStudents}
              getOptionLabel={(option: Student) => `${option.first_name} ${option.last_name}`}
              value={selectedStudent}
              onChange={(_, value) => setSelectedStudent(value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Начните вводить имя..." 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default,
                      '& fieldset': {
                        borderRadius: 2,
                      },
                      '&:hover fieldset': {
                        borderRadius: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderRadius: 2,
                      }
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 1.5,
                }}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.8rem',
                    backgroundColor: theme.palette.primary.main + '20',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}>
                    {option.first_name.charAt(0)}{option.last_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.first_name} {option.last_name}
                    </Typography>
                  </Box>
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              noOptionsText="Ученики не найдены"
              autoHighlight
              clearOnBlur={false}
            />
          </Box>
        )}

        {/* Selected Student Preview */}
        {selectedStudent && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: theme.palette.success.main + '10',
            border: `1px solid ${theme.palette.success.main}20`,
            mb: 3 
          }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.success.main, 
              width: 40, 
              height: 40, 
              fontSize: '0.9rem', 
              fontWeight: 600,
              color: theme.palette.success.contrastText,
            }}>
              {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Готов к добавлению на тренировку
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 3,
          '& > button': {
            minHeight: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }
        }}>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isLoading}
            sx={{ 
              flex: 1,
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Отмена
          </Button>
          
          <Button
            variant="contained"
            onClick={handleAddStudent}
            disabled={isLoading || !selectedStudent || capacityInfo.isFull}
            startIcon={isLoading ? null : <PersonAddIcon />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.success.main,
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
              }
            }}
          >
            {isLoading ? 'Добавляем...' : 'Добавить ученика'}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default AddStudentToRealTrainingBottomSheet;
