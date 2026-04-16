import React, { useMemo, memo, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, 
  Typography, IconButton, Box, Grid,
  useTheme, alpha, Autocomplete, TextField, useMediaQuery,
  FormControlLabel, Checkbox, SwipeableDrawer
} from '@mui/material';
import { FormikAutocomplete } from '../../../../../components/forms/fields';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Formik, Form, FormikHelpers, FieldArray } from 'formik';
import * as Yup from 'yup';
import { RealTrainingCreate } from '../../../models/realTraining';
import {
  useCreateRealTrainingMutation,
  useAddStudentToRealTrainingMutation,
} from '../../../../../store/apis/calendarApi-v2';
import { useGetTrainingTypesQuery } from '../../../../../store/apis/trainingTypesApi';
import { useGetTrainersQuery } from '../../../../../store/apis/trainersApi';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { ITrainingType } from '../../../../training-types/models/trainingType';
import { ITrainerResponse } from '../../../../trainers/models/trainer';
import { IStudent } from '../../../../students/models/student';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { BottomSheetHandle, getBottomSheetPaperSx } from '../bottom-sheets/bottomSheetStyles';
import { Dayjs } from 'dayjs';

interface RealTrainingFormProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
  forceSheet?: boolean;
}

interface StudentAssignment {
  student: IStudent | null;
  isTrial: boolean;
}

interface FormValues {
  trainingType: ITrainingType | null;
  responsibleTrainer: ITrainerResponse | null;
  studentAssignments: StudentAssignment[];
}

const validationSchema = Yup.object().shape({
  trainingType: Yup.object().nullable().required('Выберите вид тренировки'),
  responsibleTrainer: Yup.object().nullable().required('Выберите тренера'),
  studentAssignments: Yup.array()
    .of(
      Yup.object().shape({
        student: Yup.object()
          .shape({ id: Yup.number().required() })
          .nullable()
          .required('Выберите ученика'),
      })
    )
    .test('unique-students', 'Ученики не должны повторяться', function (value) {
      if (!value || value.length < 2) return true;
      const ids = value.map((a: any) => a?.student?.id).filter((id: any) => id != null);
      return new Set(ids).size === ids.length;
    })
    .nullable(),
});

const RealTrainingForm: React.FC<RealTrainingFormProps> = ({ open, onClose, selectedDate, selectedTime, forceSheet }) => {
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = forceSheet ?? isMobileQuery;
  const [templateTime, setTemplateTime] = useState<string | null>(null);
  const [createRealTraining] = useCreateRealTrainingMutation();
  const [addStudentToRealTraining] = useAddStudentToRealTrainingMutation();

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
    studentAssignments: [],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    try {
      const timeToUse = templateTime || selectedTime;
      if (!selectedDate || !timeToUse || !values.trainingType || !values.responsibleTrainer) {
        throw new Error("Основные поля не заполнены");
      }

      const trainingData: RealTrainingCreate = {
        training_type_id: values.trainingType.id,
        responsible_trainer_id: values.responsibleTrainer.id,
        training_date: selectedDate.format('YYYY-MM-DD'),
        start_time: timeToUse.includes(':') ? timeToUse : `${timeToUse}:00`,
      };

      const createdTraining = await createRealTraining(trainingData).unwrap();

      if (values.studentAssignments && values.studentAssignments.length > 0) {
        await Promise.all(
          values.studentAssignments
            .filter(a => a.student != null)
            .map(a =>
              addStudentToRealTraining({
                training_id: createdTraining.id,
                student_id: a.student!.id,
                is_trial: a.isTrial,
              }).unwrap()
            )
        );
      }

      resetForm();
      onClose();
      displaySnackbar('Тренировка успешно создана!', 'success');

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

  const formContent = (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={false}
    >
      {({ values, isSubmitting, dirty, isValid, setFieldValue, setFieldTouched, errors, touched }) => {
        const borderColor = useMemo(
          () => values.trainingType?.color || theme.palette.primary.main,
          [values.trainingType?.color, theme.palette.primary.main]
        );

        const styles = useMemo(() => ({
          dialogTitle: {
            borderTop: `4px solid ${borderColor}`,
            backgroundColor: alpha(borderColor, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
          },
          cardBorder: { mb: 3, border: `1px solid ${alpha(borderColor, 0.3)}` },
          timeBox: { p: 2, backgroundColor: alpha(borderColor, 0.05), borderRadius: 1 },
          dialogActions: { p: 3, backgroundColor: alpha(borderColor, 0.02) },
          saveButton: { backgroundColor: alpha(borderColor, 0.8) },
        }), [borderColor]);

        const contentBody = (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Date & Time */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventNoteIcon sx={{ color: borderColor }} />
                Время и дата
              </Typography>
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
            </Box>

            {/* Training Type */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FitnessCenterIcon sx={{ color: borderColor }} />
                Тип тренировки
              </Typography>
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
            </Box>

            {/* Trainer */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: borderColor }} />
                Ответственный тренер
              </Typography>
              <FormikAutocomplete<ITrainerResponse>
                name="responsibleTrainer"
                label="Выберите тренера"
                options={trainers || []}
                getOptionLabel={(option) => option ? `${option.first_name || ''} ${option.last_name || ''}` : ''}
                isOptionEqualToValue={(option, value) => value !== null && option.id === value.id}
                isLoading={isLoadingTrainers}
                textFieldProps={{ fullWidth: true }}
              />
            </Box>

            {/* Students */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon sx={{ color: borderColor }} />
                  Ученики
                </Typography>
                <Typography variant="body2" color="text.secondary">(необязательно)</Typography>
              </Box>

              <FieldArray name="studentAssignments">
                {(arrayHelpers) => (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => arrayHelpers.push({ student: null, isTrial: false })}
                      sx={{ mb: 1.5, borderColor: alpha(borderColor, 0.6), color: borderColor }}
                    >
                      Добавить ученика
                    </Button>

                    {values.studentAssignments && values.studentAssignments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {values.studentAssignments.map((assignment, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              border: `1px solid ${alpha(borderColor, 0.2)}`,
                              backgroundColor: alpha(borderColor, 0.02),
                            }}
                          >
                            <Grid container spacing={1} alignItems="center">
                              <Grid item xs={12} sm={7}>
                                <FormikAutocomplete<IStudent>
                                  name={`studentAssignments.${index}.student`}
                                  label="Ученик"
                                  options={studentOptions || []}
                                  getOptionLabel={(option) => option ? `${option.first_name} ${option.last_name}` : ''}
                                  isOptionEqualToValue={(option, value) => value !== null && option.id === value.id}
                                  isLoading={isLoadingStudents}
                                  textFieldProps={{ size: 'small', fullWidth: true }}
                                />
                              </Grid>
                              <Grid item xs={9} sm={3}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={assignment.isTrial}
                                      onChange={(e) =>
                                        setFieldValue(`studentAssignments.${index}.isTrial`, e.target.checked)
                                      }
                                      sx={{ color: borderColor, '&.Mui-checked': { color: borderColor } }}
                                    />
                                  }
                                  label={<Typography variant="body2">Пробное</Typography>}
                                />
                              </Grid>
                              <Grid item xs={3} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton color="error" onClick={() => arrayHelpers.remove(index)} size="small">
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Ученики пока не добавлены
                      </Typography>
                    )}
                  </>
                )}
              </FieldArray>
            </Box>
          </Box>
        );

        return (
          <Form>
            {isMobile ? (
              <>
                <Box
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderBottom: `1px solid ${alpha(borderColor, 0.2)}`,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <FitnessCenterIcon sx={{ color: borderColor }} />
                  <Typography variant="h6" component="h2">Создать тренировку</Typography>
                </Box>

                <Box sx={{ p: 2 }}>
                  {contentBody}
                </Box>

                <Box
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 2,
                    borderTop: `1px solid ${alpha(borderColor, 0.2)}`,
                    ...styles.dialogActions,
                    backgroundColor: theme.palette.background.paper,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button onClick={onClose} color="inherit" size="large">Отмена</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !dirty || !isValid}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
                    sx={{ backgroundColor: borderColor, '&:hover': styles.saveButton }}
                  >
                    {isSubmitting ? 'Создаётся...' : 'Создать тренировку'}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <DialogTitle sx={styles.dialogTitle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon sx={{ color: borderColor }} />
                    <Typography variant="h6" component="h2">Создать тренировку</Typography>
                  </Box>
                  <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  {contentBody}
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                  <Button onClick={onClose} color="inherit" size="large">Отмена</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !dirty || !isValid}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
                    sx={{ backgroundColor: borderColor, '&:hover': styles.saveButton }}
                  >
                    {isSubmitting ? 'Создаётся...' : 'Создать тренировку'}
                  </Button>
                </DialogActions>
              </>
            )}
          </Form>
        );
      }}
    </Formik>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={onClose}
          onOpen={() => {}}
          disableSwipeToOpen
          PaperProps={{
            sx: getBottomSheetPaperSx(theme, {
              height: '85vh',
              maxHeight: '85vh',
              overflow: 'hidden',
            }),
          }}
        >
          <BottomSheetHandle />
          <Box sx={{ height: '85vh', overflowY: 'auto' }}>
            {formContent}
          </Box>
        </SwipeableDrawer>
      ) : (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          {formContent}
        </Dialog>
      )}
    </LocalizationProvider>
  );
};

export default memo(RealTrainingForm);