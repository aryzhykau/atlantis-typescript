import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress, 
  TextField as MuiTextField, Typography, AutocompleteRenderInputParams, Chip, IconButton, Box
} from '@mui/material';
import { Autocomplete } from 'formik-mui';
import { DesktopDatePicker } from 'formik-mui-x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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
  const [createTrainingTemplate, { isLoading: isCreating, error: createError }] = useCreateTrainingTemplateMutation();
  const [createTrainingStudentTemplate, { isLoading: isCreatingStudentAssignment, error: studentAssignmentError }] = useCreateTrainingStudentTemplateMutation();
  
  const { data: trainingTypes, isLoading: isLoadingTypes, error: typesError } = useGetTrainingTypesQuery({});
  const { data: trainersData, isLoading: isLoadingTrainers, error: trainersError } = useGetTrainersQuery();
  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useGetStudentsQuery();
  
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

    } catch (err) {
      console.error('Ошибка при создании шаблона или назначении учеников:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Создать шаблон тренировки</DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting, dirty, isValid, setFieldValue }) => {
            useEffect(() => {
              if (open) {
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [open]);
            
            return (
              <Form>
                <DialogContent>
                  {selectedDate && selectedTime && (
                    <MuiTextField
                      label="Выбранный слот"
                      value={`${selectedDate.format('dd, D MMM YYYY')} в ${selectedTime}`}
                      disabled
                      fullWidth
                      margin="normal"
                    />
                  )}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="trainingType"
                        component={Autocomplete}
                        options={trainingTypes || []}
                        getOptionLabel={(option: ITrainingType) => option?.name || ''}
                        isOptionEqualToValue={(option: ITrainingType, value: ITrainingType | null) => value !== null && option.id === value.id}
                        loading={isLoadingTypes}
                        textFieldProps={{
                          label: "Вид тренировки",
                          error: !!typesError, 
                          helperText: typesError ? 'Ошибка загрузки видов' : undefined 
                        }}
                        renderInput={(rawParams: AutocompleteRenderInputParams) => {
                          const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                          return (
                            <MuiTextField
                              {...params}
                              label="Вид тренировки"
                              error={params.error}
                              helperText={params.helperText || ' '}
                            />
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="responsibleTrainer"
                        component={Autocomplete}
                        options={trainers || []}
                        getOptionLabel={(option: ITrainerResponse) => option ? `${option.first_name || ''} ${option.last_name || ''} (ID: ${option.id})` : ''} 
                        isOptionEqualToValue={(option: ITrainerResponse, value: ITrainerResponse | null) => value !== null && option.id === value.id}
                        loading={isLoadingTrainers}
                        textFieldProps={{
                          label: "Тренер",
                          error: !!trainersError,
                          helperText: trainersError ? 'Ошибка загрузки тренеров' : undefined
                        }}
                        renderInput={(rawParams: AutocompleteRenderInputParams) => {
                          const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                          return (
                            <MuiTextField
                              {...params}
                              label="Тренер"
                              error={params.error}
                              helperText={params.helperText || ' '}
                            />
                          );
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Ученики</Typography>
                      <FieldArray name="studentAssignments">
                        {(arrayHelpers) => (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => arrayHelpers.push({ student: null, startDate: selectedDate })}
                              sx={{ mb: 1 }}
                            >
                              Добавить ученика
                            </Button>
                            <Box sx={{ height: '250px', overflowY: 'auto', pr: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p:1 }}>
                              {values.studentAssignments && values.studentAssignments.length > 0 ? (
                                values.studentAssignments.map((assignment, index) => (
                                  <Grid container spacing={2} key={index} alignItems="flex-start" sx={{ mb: 1 }}>
                                    <Grid item xs={12} sm={5}>
                                      <Field
                                        name={`studentAssignments.${index}.student`}
                                        component={Autocomplete}
                                        options={studentOptions || []}
                                        getOptionLabel={(option: IStudent) => option ? `${option.first_name} ${option.last_name} (ID: ${option.id})` : ''}
                                        isOptionEqualToValue={(option: IStudent, value: IStudent | null) => value !== null && option.id === value.id}
                                        loading={isLoadingStudents}
                                        textFieldProps={{
                                          label: "Ученик",
                                          error: !!studentsError, 
                                          helperText: studentsError ? 'Ошибка загрузки учеников' : undefined,
                                          size: "small"
                                        }}
                                        renderInput={(rawParams: AutocompleteRenderInputParams) => {
                                          const params = rawParams as AutocompleteRenderInputParams & { error?: boolean; helperText?: string };
                                          return (
                                            <MuiTextField
                                              {...params}
                                              label="Ученик"
                                              error={params.error}
                                              helperText={params.helperText || ' '}
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
                                        slotProps={{ textField: { size: 'small' } }}
                                      />
                                    </Grid>
                                    <Grid item xs={2} sm={2} textAlign="right">
                                      <IconButton onClick={() => arrayHelpers.remove(index)} color="error" size="small">
                                        <RemoveCircleOutlineIcon />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                ))
                              ) : (
                                <Typography variant="body2" color="textSecondary" sx={{my:1, textAlign: 'center'}}>Нет добавленных учеников.</Typography>
                              )}
                            </Box>
                          </>
                        )}
                      </FieldArray>
                    </Grid>

                    {(createError || studentAssignmentError) && (
                      <Grid item xs={12} sx={{mt:2}}>
                        <Typography color="error">
                          Ошибка: {createError ? JSON.stringify(createError) : ''} 
                                 {studentAssignmentError ? JSON.stringify(studentAssignmentError) : ''}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => { onClose(); }}>Отмена</Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting || !dirty || !isValid || isCreating || isCreatingStudentAssignment}>
                    {isSubmitting || isCreating || isCreatingStudentAssignment ? <CircularProgress size={24} /> : 'Создать'}
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

export default TrainingTemplateForm;