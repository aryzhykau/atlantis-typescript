import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  Autocomplete, 
  TextField,
  useTheme 
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { AddStudentFormProps, Student } from './types';

/**
 * AddStudentForm - Form for adding students to training templates
 * Single responsibility: Student addition form logic and UI
 */
const AddStudentForm: React.FC<AddStudentFormProps> = ({
  availableStudents,
  onAddStudent,
  onCancel,
  isLoading
}) => {
  const theme = useTheme();
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    // Auto-scroll to form when mounted
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      
      // Focus on the autocomplete input after scroll
      setTimeout(() => {
        const autocompleteInput = formRef.current?.querySelector('input[placeholder="Начните вводить имя..."]') as HTMLInputElement;
        autocompleteInput?.focus();
      }, 300);
    }
  }, []);

  const handleAddStudent = () => {
    if (selectedStudent) {
      onAddStudent(selectedStudent, startDate);
      setSelectedStudent(null);
    }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    onCancel();
  };

  return (
    <Box 
      ref={formRef}
      sx={{ 
        p: 3,
        borderRadius: 3, 
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}20`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        mt: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          borderRadius: '3px 3px 0 0',
        }
      }}
    >
      {/* Form Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
      }}>
        <Avatar sx={{ 
          width: 40, 
          height: 40, 
          fontSize: '1.2rem', 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 700,
        }}>
          <PersonAddIcon fontSize="medium" />
        </Avatar>
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              mb: 0.5,
            }}
          >
            Добавить ученика в шаблон
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
            }}
          >
            {availableStudents.length > 0 
              ? `Доступно ${availableStudents.length} учеников`
              : 'Все ученики уже добавлены в шаблон'
            }
          </Typography>
        </Box>
      </Box>

      {/* Show message if no students available */}
      {availableStudents.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3,
          color: theme.palette.text.secondary,
        }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Все активные ученики уже добавлены в этот шаблон
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
            sx={{ textTransform: 'none' }}
          >
            Закрыть
          </Button>
        </Box>
      )}

      {/* Form Fields - only show if students available */}
      {availableStudents.length > 0 && (
        <>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            mb: 3,
            alignItems: { xs: 'stretch', sm: 'flex-end' }
          }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Ученик
              </Typography>
              <Autocomplete
                options={availableStudents}
                getOptionLabel={(opt: Student) => `${opt.first_name} ${opt.last_name}`}
                value={selectedStudent}
                onChange={(_, val) => setSelectedStudent(val)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Начните вводить имя..." 
                    variant="outlined" 
                    size="medium"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: 48,
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
                      '& .MuiInputBase-input': {
                        backgroundColor: 'transparent',
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box 
                    component="li" 
                    {...props} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1.5,
                    }}
                  >
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
            
            <Box sx={{ minWidth: { xs: '100%', sm: 160 } }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Дата начала
              </Typography>
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 48,
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
                  '& .MuiInputBase-input': {
                    backgroundColor: 'transparent',
                  }
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            justifyContent: 'flex-end',
            '& > button': {
              minHeight: 44,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 100,
            }
          }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              sx={{ 
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
              disabled={isLoading || !selectedStudent}
              startIcon={isLoading ? null : <PersonAddIcon />}
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                }
              }}
            >
              {isLoading ? 'Добавление...' : 'Добавить ученика'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AddStudentForm;
