import React, { useMemo, memo, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, 
  Typography, IconButton, Box,
  useTheme, alpha, Divider, Card, CardContent, Autocomplete, TextField, useMediaQuery
} from '@mui/material';
import { FormikAutocomplete } from '../../../../../components/forms/fields';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { RealTrainingCreate } from '../../../models/realTraining';
import { useCreateRealTrainingMutation } from '../../../../../store/apis/calendarApi-v2';
import { useGetTrainingTypesQuery } from '../../../../../store/apis/trainingTypesApi';
import { useGetTrainersQuery } from '../../../../../store/apis/trainersApi';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { ITrainingType } from '../../../../training-types/models/trainingType';
import { ITrainerResponse } from '../../../../trainers/models/trainer';
import { IStudent } from '../../../../students/models/student';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { Dayjs } from 'dayjs';

interface RealTrainingFormProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
}

interface FormValues {
  trainingType: ITrainingType | null;
  responsibleTrainer: ITrainerResponse | null;
  trialStudent: IStudent | null;
}

const validationSchema = Yup.object().shape({
  trainingType: Yup.object().nullable().required('Выберите вид тренировки'),
  responsibleTrainer: Yup.object().nullable().required('Выберите тренера'),
  trialStudent: Yup.object().nullable().required('Выберите пробного ученика'),
});

const RealTrainingForm: React.FC<RealTrainingFormProps> = ({ open, onClose, selectedDate, selectedTime }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [templateTime, setTemplateTime] = useState<string | null>(null);
  const [createRealTraining] = useCreateRealTrainingMutation();
  
  const { data: trainingTypes, isLoading: isLoadingTypes } = useGetTrainingTypesQuery({});
  const { data: trainersData, isLoading: isLoadingTrainers } = useGetTrainersQuery();
  const { data: students, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { displaySnackbar } = useSnackbar();
  
  const trainers = trainersData?.trainers || [];
  const studentOptions = students || [];

  useEffect(() => {
    if (selectedTime) {
      const parts = selectedTime.split(':');
      if (parts.length >= 2) setTemplateTime(`${parts[0].padStart(2, '0')}:00`);
    } else {
      setTemplateTime(null);
    }
  }, [selectedTime]);
  
  const uniqueTrainingTypes = useMemo(() => {
    if (!trainingTypes) return [];
    const filtered = trainingTypes.filter(type => type && type.name && type.name.trim() !== '');
    const unique = filtered.filter((type, index, self) => 
      self.findIndex(t => t.id === type.id) === index
    );
    return unique;
  }, [trainingTypes]);

  const initialValues: FormValues = {
    trainingType: null,
    responsibleTrainer: null,
    trialStudent: null,
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    try {
      const timeToUse = templateTime || selectedTime;
      if (!selectedDate || !timeToUse || !values.trainingType || !values.responsibleTrainer || !values.trialStudent) {
        throw new Error("Основные поля не заполнены");
      }

      const trainingData: RealTrainingCreate = {
        training_type_id: values.trainingType.id,
        responsible_trainer_id: values.responsibleTrainer.id,
        training_date: selectedDate.format('YYYY-MM-DD'),
        start_time: timeToUse.includes(':') ? timeToUse : `${timeToUse}:00`,
        trial_student_id: values.trialStudent.id,
      };

      await createRealTraining(trainingData).unwrap();

      resetForm();
      onClose();
      displaySnackbar('Пробная тренировка успешно создана!', 'success');

    } catch (err: any) {
      let errorMessage = 'Ошибка при создании тренировки';
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
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({ values, isSubmitting, dirty, isValid, setFieldValue, setFieldTouched, errors, touched }) => {
            const borderColor = useMemo(() => 
              values.trainingType?.color || theme.palette.primary.main, 
              [values.trainingType?.color, theme.palette.primary.main]
            );
            
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
              dialogActions: {
                p: 3, 
                backgroundColor: alpha(borderColor, 0.02)
              },
              saveButton: {
                backgroundColor: alpha(borderColor, 0.8)
              },
            }), [borderColor]);
            
            return (
              <Form>
                <DialogTitle sx={styles.dialogTitle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon sx={{ color: borderColor }} />
                    <Typography variant="h6" component="h2">
                      Создать пробную тренировку
                    </Typography>
                  </Box>
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventNoteIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Время и дата</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                  {selectedDate && (
                        <Box sx={styles.timeBox}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            📅 {selectedDate.format('dddd, D MMMM YYYY')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                            <Autocomplete
                              size="small"
                              sx={{ width: 140 }}
                              options={Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)}
                              value={templateTime}
                              onChange={(_, val) => setTemplateTime(val)}
                              renderInput={(params) => <TextField {...params} label="Время" />}
                            />
                          </Box>
                        </Box>
                  )}
                    </CardContent>
                  </Card>

                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FitnessCenterIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Тип тренировки</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Autocomplete
                        options={uniqueTrainingTypes}
                        getOptionLabel={(option) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => value !== null && option.id === value.id}
                        loading={isLoadingTypes}
                        value={values.trainingType}
                        onChange={(_, newValue) => {
                          setFieldValue('trainingType', newValue);
                          setFieldTouched('trainingType', true);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Выберите тип тренировки"
                            fullWidth
                            error={touched.trainingType && Boolean(errors.trainingType)}
                            helperText={touched.trainingType && errors.trainingType}
                          />
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Ответственный тренер</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormikAutocomplete<ITrainerResponse>
                        name="responsibleTrainer"
                        label="Выберите тренера"
                        options={trainers || []}
                        getOptionLabel={(option) => option ? `${option.first_name || ''} ${option.last_name || ''}` : ''} 
                        isOptionEqualToValue={(option, value) => value !== null && option.id === value.id}
                        isLoading={isLoadingTrainers}
                        textFieldProps={{
                          fullWidth: true
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card sx={styles.cardBorder}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon sx={{ color: borderColor }} />
                        <Typography variant="h6">Пробный ученик</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormikAutocomplete<IStudent>
                        name="trialStudent"
                        label="Выберите ученика"
                        options={studentOptions || []}
                        getOptionLabel={(option) => option ? `${option.first_name} ${option.last_name}` : ''}
                        isOptionEqualToValue={(option, value) => value !== null && option.id === value.id}
                        isLoading={isLoadingStudents}
                        textFieldProps={{
                          fullWidth: true
                        }}
                      />
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
                    {isSubmitting ? 'Создаётся...' : 'Создать тренировку'}
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

export default memo(RealTrainingForm);