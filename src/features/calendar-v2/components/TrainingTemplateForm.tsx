import React, { useEffect, useMemo, memo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress, 
  TextField as MuiTextField, Typography, AutocompleteRenderInputParams, Chip, IconButton, Box,
  useTheme, alpha, Divider, Paper, Card, CardContent
} from '@mui/material';
import { Autocomplete } from 'formik-mui';
import { DesktopDatePicker } from 'formik-mui-x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import dayjs, { Dayjs } from 'dayjs';
import { Formik, Form, Field, FormikHelpers, FieldArray } from 'formik';
import * as Yup from 'yup';
import { TrainingTemplateCreate, TrainingTemplate } from '../models/trainingTemplate';
import { 
  useCreateTrainingTemplateMutation, 
  useCreateTrainingStudentTemplateMutation, 
} from '../../../store/apis/calendarApi-v2';
import { TrainingStudentTemplateCreate } from '../models/trainingStudentTemplate';
import { useGetTrainingTypesQuery } from '../../../store/apis/trainingTypesApi';
import { useGetTrainersQuery } from '../../../store/apis/trainersApi';
import { useGetStudentsQuery } from '../../../store/apis/studentsApi';
import { ITrainingType } from '../../training-types/models/trainingType';
import { ITrainerResponse } from '../../trainers/models/trainer';
import { IStudent } from '../../students/models/student';
import { useSnackbar } from '../../../hooks/useSnackBar';

interface TrainingTemplateFormProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
}

interface StudentAssignmentValue {
  student: IStudent | null;
  startDate: Dayjs | null;
}

interface FormValues {
  trainingType: ITrainingType | null;
  responsibleTrainer: ITrainerResponse | null;
  studentAssignments: StudentAssignmentValue[]; 
}

const validationSchema = Yup.object().shape({
  trainingType: Yup.object().nullable().required('Выберите вид тренировки'),
  responsibleTrainer: Yup.object().nullable().required('Выберите тренера'),
  studentAssignments: Yup.array()
    .of(
      Yup.object().shape({
        student: Yup.object()
          .shape({
            id: Yup.number().required(),
          })
          .nullable()
          .required('Ученик должен быть выбран'),
        startDate: Yup.date().nullable().required('Дата начала должна быть указана'),
      })
    )
    .test('unique-students', 'Ученики не должны повторяться в списке', function (value) {
      if (!value || value.length < 2) {
        return true;
      }
      const studentIds = value.map(assignment => assignment?.student?.id).filter(id => id != null);
      return new Set(studentIds).size === studentIds.length;
    })
    .nullable(),
});

const TrainingTemplateForm: React.FC<TrainingTemplateFormProps> = ({ open, onClose, selectedDate, selectedTime }) => {
  const theme = useTheme();
  const [createTrainingTemplate] = useCreateTrainingTemplateMutation();
  const [createTrainingStudentTemplate] = useCreateTrainingStudentTemplateMutation();
  
  const { data: trainingTypes, isLoading: isLoadingTypes, error: typesError } = useGetTrainingTypesQuery({});
  const { data: trainersData, isLoading: isLoadingTrainers, error: trainersError } = useGetTrainersQuery();
  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useGetStudentsQuery();
  const { displaySnackbar } = useSnackbar();
  
  const trainers = trainersData?.trainers || [];
  const studentOptions = students || [];

  const initialValues: FormValues = {
    trainingType: null,
    responsibleTrainer: null,
    studentAssignments: [],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    try {
      if (!selectedDate || !selectedTime || !values.trainingType || !values.responsibleTrainer) {
        throw new Error("Основные поля не заполнены");
      }

      const templateData: TrainingTemplateCreate = {
        training_type_id: values.trainingType.id,
        responsible_trainer_id: values.responsibleTrainer.id,
        day_number: selectedDate.isoWeekday(),
        start_time: `${selectedTime}:00`,
      };

      const createdTemplate: TrainingTemplate = await createTrainingTemplate(templateData).unwrap();
      const templateId = createdTemplate.id;

      if (values.studentAssignments && values.studentAssignments.length > 0) {
        const studentAssignmentPromises = values.studentAssignments.map((assignment: StudentAssignmentValue) => {
          if (assignment.student && assignment.startDate) {
            const studentTemplateData: TrainingStudentTemplateCreate = {
              training_template_id: templateId,
              student_id: assignment.student.id,
              start_date: assignment.startDate.format('YYYY-MM-DD'),
            };
            return createTrainingStudentTemplate(studentTemplateData).unwrap();
          }
          return Promise.resolve(null);
        });

        await Promise.all(studentAssignmentPromises);
      }

      resetForm();
      onClose();
      displaySnackbar('Шаблон тренировки успешно создан!', 'success');

    } catch (err: any) {
      console.error('Ошибка при создании шаблона или назначении учеников:', err);
      
      // Извлекаем сообщение об ошибке из ответа сервера
      let errorMessage = 'Ошибка при создании шаблона тренировки';
      
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      displaySnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({ values, isSubmitting, dirty, isValid, setFieldValue }) => {
            // Мемоизируем borderColor чтобы избежать пересчета при каждом рендере
            const borderColor = useMemo(() => 
              values.trainingType?.color || theme.palette.primary.main, 
              [values.trainingType?.color, theme.palette.primary.main]
            );
            
            // Мемоизируем все стили с alpha для лучшей производительности
            const styles = useMemo(() => ({
              dialogTitle: {
                borderTop: `4px solid ${borderColor}`,
                backgroundColor: alpha(borderColor, 0.05),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 2
              },
              cardBorder: {
                mb: 3, 
                border: `1px solid ${alpha(borderColor, 0.3)}`
              },
              timeBox: {
                p: 2, 
                backgroundColor: alpha(borderColor, 0.05), 
                borderRadius: 1
              },
              timeChip: {
                mt: 1, 
                backgroundColor: alpha(borderColor, 0.1)
              },
              dialogActions: {
                p: 3, 
                backgroundColor: alpha(borderColor, 0.02)
              },
              saveButton: {
                backgroundColor: alpha(borderColor, 0.8)
              },
              paperStyles: {
                p: 2, 
                mb: 2, 
                border: `1px solid ${alpha(borderColor, 0.2)}`,
                backgroundColor: alpha(borderColor, 0.02)
              }
            }), [borderColor]);
            
            return (
              <Form>
                {/* Заголовок с цветовой темой */}
                <DialogTitle sx={styles.dialogTitle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon sx={{ color: borderColor }} />
                    <Typography variant="h6" component="h2">
                      Создать шаблон тренировки
                    </Typography>
                  </Box>
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                  {/* Секция: Выбранное время */}
                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventNoteIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Время и дата</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      {selectedDate && selectedTime && (
                        <Box sx={styles.timeBox}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            📅 {selectedDate.format('dddd, D MMMM YYYY')}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                            🕐 {selectedTime}
                          </Typography>
                          <Chip 
                            label={`День недели: ${selectedDate.isoWeekday()}`}
                            size="small" 
                            sx={styles.timeChip}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Секция: Тип тренировки */}
                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FitnessCenterIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Тип тренировки</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Field
                        name="trainingType"
                        component={Autocomplete}
                        options={trainingTypes || []}
                        getOptionLabel={(option: ITrainingType) => option?.name || ''}
                        isOptionEqualToValue={(option: ITrainingType, value: ITrainingType | null) => value !== null && option.id === value.id}
                        loading={isLoadingTypes}
                        renderOption={(props: any, option: ITrainingType) => (
                          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                backgroundColor: option.color || theme.palette.grey[400] 
                              }} 
                            />
                            <Typography>{option.name}</Typography>
                            {option.max_participants && (
                              <Chip label={`до ${option.max_participants} чел.`} size="small" sx={{ ml: 'auto' }} />
                            )}
                          </Box>
                        )}
                        textFieldProps={{
                          label: "Выберите тип тренировки",
                          error: !!typesError, 
                          helperText: typesError ? 'Ошибка загрузки типов тренировок' : undefined,
                          fullWidth: true
                        }}
                        renderInput={(rawParams: AutocompleteRenderInputParams) => {
                          const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                          return (
                            <MuiTextField
                              {...params}
                              label="Выберите тип тренировки"
                              error={params.error}
                              helperText={params.helperText}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: values.trainingType && (
                                  <Box 
                                    sx={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      backgroundColor: values.trainingType.color || theme.palette.grey[400],
                                      mr: 1
                                    }} 
                                  />
                                )
                              }}
                            />
                          );
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Секция: Тренер */}
                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Ответственный тренер</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Field
                        name="responsibleTrainer"
                        component={Autocomplete}
                        options={trainers || []}
                        getOptionLabel={(option: ITrainerResponse) => option ? `${option.first_name || ''} ${option.last_name || ''}` : ''} 
                        isOptionEqualToValue={(option: ITrainerResponse, value: ITrainerResponse | null) => value !== null && option.id === value.id}
                        loading={isLoadingTrainers}
                        textFieldProps={{
                          label: "Выберите тренера",
                          error: !!trainersError,
                          helperText: trainersError ? 'Ошибка загрузки тренеров' : undefined,
                          fullWidth: true
                        }}
                        renderInput={(rawParams: AutocompleteRenderInputParams) => {
                          const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                          return (
                            <MuiTextField
                              {...params}
                              label="Выберите тренера"
                              error={params.error}
                              helperText={params.helperText}
                            />
                          );
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Секция: Ученики */}
                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <GroupIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Ученики</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          (необязательно)
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FieldArray name="studentAssignments">
                        {(arrayHelpers) => (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => arrayHelpers.push({ student: null, startDate: selectedDate })}
                              sx={{ mb: 2 }}
                              color="primary"
                            >
                              Добавить ученика
                            </Button>
                            
                            {values.studentAssignments && values.studentAssignments.length > 0 ? (
                              <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {values.studentAssignments.map((assignment, index) => (
                                  <Paper 
                                    key={index} 
                                    sx={styles.paperStyles}
                                  >
                                    <Grid container spacing={2} alignItems="center">
                                      <Grid item xs={12} sm={5}>
                                        <Field
                                          name={`studentAssignments.${index}.student`}
                                          component={Autocomplete}
                                          options={studentOptions || []}
                                          getOptionLabel={(option: IStudent) => option ? `${option.first_name} ${option.last_name}` : ''}
                                          isOptionEqualToValue={(option: IStudent, value: IStudent | null) => value !== null && option.id === value.id}
                                          loading={isLoadingStudents}
                                          textFieldProps={{
                                            label: "Ученик",
                                            error: !!studentsError, 
                                            helperText: studentsError ? 'Ошибка загрузки учеников' : undefined,
                                            size: "small",
                                            fullWidth: true
                                          }}
                                          renderInput={(rawParams: AutocompleteRenderInputParams) => {
                                            const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                                            return (
                                              <MuiTextField
                                                {...params}
                                                label="Ученик"
                                                error={params.error}
                                                helperText={params.helperText}
                                                size="small"
                                              />
                                            );
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={10} sm={5}>
                                        <Field
                                          name={`studentAssignments.${index}.startDate`}
                                          component={DesktopDatePicker}
                                          label="Дата начала"
                                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                      </Grid>
                                      <Grid item xs={2} sm={2}>
                                        <IconButton
                                          color="error"
                                          onClick={() => arrayHelpers.remove(index)}
                                          size="small"
                                        >
                                          <RemoveCircleOutlineIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                ))}
                              </Box>
                            ) : (
                              <Box 
                                sx={{ 
                                  p: 4, 
                                  textAlign: 'center', 
                                  backgroundColor: alpha(theme.palette.grey[500], 0.05),
                                  borderRadius: 1,
                                  border: `1px dashed ${theme.palette.grey[300]}`
                                }}
                              >
                                <GroupIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  Ученики пока не добавлены
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Вы можете добавить их сейчас или позже
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </FieldArray>
                    </CardContent>
                  </Card>
                </DialogContent>

                <DialogActions sx={styles.dialogActions}>
                  <Button onClick={onClose} color="inherit" size="large">
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    disabled={isSubmitting || !dirty || !isValid}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
                    sx={{
                      backgroundColor: borderColor,
                      '&:hover': styles.saveButton
                    }}
                  >
                    {isSubmitting ? 'Создаётся...' : 'Создать шаблон'}
                  </Button>
                </DialogActions>
              </Form>
            );
          }}
        </Formik>
      </Dialog>
    </LocalizationProvider>
  );
};

export default memo(TrainingTemplateForm);