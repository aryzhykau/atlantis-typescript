import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  Chip,
  Avatar,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Euro,
  Add as AddIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { TextField as FormikTextField, Select as FormikSelect } from 'formik-mui';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useCreateQuickPaymentMutation, useGetTrainerTrainingsRangeQuery, useGetTrainerPaymentsQuery, useGetTrainerStudentsQuery } from '../api/trainerApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useAuth } from '../../../hooks/useAuth';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';

type PeriodFilter = 'week' | 'month' | '3months';

interface PaymentFormData {
  student_id: number;
  amount: string;
}

const PaymentSchema = Yup.object({
  student_id: Yup.number().required('Выберите студента'),
  amount: Yup.number()
    .required('Введите сумму')
    .positive('Сумма должна быть больше 0')
    .min(0.01, 'Минимальная сумма 0.01 €'),
});

export const TrainerPayments: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('week');

  const { displaySnackbar } = useSnackbar();
  const [createPayment, { isLoading: isCreating }] = useCreateQuickPaymentMutation();

  // Получаем текущего пользователя (тренера)
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const trainerId = user?.id;

  // Получаем студентов тренера для селектора
  const { data: students = [], isLoading: isLoadingStudents } = useGetTrainerStudentsQuery(
    trainerId ? { trainer_id: trainerId } : skipToken
  );

  // Отладка: смотрим структуру данных студентов
  console.log('Students data:', students);
  if (students.length > 0) {
    console.log('First student:', students[0]);
    console.log('First student client:', students[0]?.client);
  }

  // Получаем платежи тренера
  const { data: payments, isLoading: isLoadingPayments } = useGetTrainerPaymentsQuery({
    period,
  });

  const handleFormSubmit = async (values: PaymentFormData, { resetForm }: any) => {
    const selectedStudent = students.find(s => s.id === values.student_id);
    if (!selectedStudent?.client?.id) {
      displaySnackbar('Ошибка: не найден клиент студента', 'error');
      return;
    }

    try {
      await createPayment({
        client_id: selectedStudent.client.id,
        amount: parseFloat(values.amount),
        description: `Оплатили за ${selectedStudent.first_name} ${selectedStudent.last_name}`,
      }).unwrap();

      displaySnackbar('Платёж успешно зарегистрирован', 'success');
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      displaySnackbar(
        error?.data?.detail || 'Ошибка при регистрации платежа',
        'error'
      );
    }
  };

  if (isLoadingUser || isLoadingStudents || isLoadingPayments) {
    return (
      <Box sx={{ p: 2, pb: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          💰 Платежи
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Регистрация и история платежей
        </Typography>
      </Box>

      {/* Create Payment Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Регистрация платежа
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showForm}
                    onChange={(e) => setShowForm(e.target.checked)}
                    color="primary"
                  />
                }
                label="Показать форму"
              />
            </Box>
          </Box>

          {showForm && (
            students.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Нет доступных студентов для регистрации платежа
              </Typography>
            ) : (
              <Formik
                initialValues={{
                  student_id: 0,
                  amount: '',
                }}
                validationSchema={PaymentSchema}
                onSubmit={handleFormSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Студент</InputLabel>
                          <Field
                            component={FormikSelect}
                            name="student_id"
                            label="Студент"
                            formControl={{ fullWidth: true }}
                          >
                            {students.map((student) => (
                              <MenuItem key={student.id} value={student.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                    <Person fontSize="small" />
                                  </Avatar>
                                  {student.first_name} {student.last_name}
                                </Box>
                              </MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          component={FormikTextField}
                          name="amount"
                          label="Сумма (€)"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <Euro sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={isSubmitting || isCreating}
                          startIcon={isCreating ? <CircularProgress size={20} /> : <PaymentIcon />}
                        >
                          {isCreating ? 'Регистрация...' : 'Зарегистрировать платёж'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            )
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Период</InputLabel>
          <Select
            value={period}
            label="Период"
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
          >
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="3months">3 месяца</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Payments History */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              История платежей ({payments?.length || 0})
            </Typography>
          </Box>

          {!payments || payments.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Нет зарегистрированных платежей за выбранный период
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {payments.map((payment: any, index: number) => (
                <Box key={payment.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    py: 1,
                  }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                      <PaymentIcon fontSize="small" />
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {payment.client?.first_name} {payment.client?.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(payment.payment_date).format('DD.MM.YYYY HH:mm')} • {payment.description}
                      </Typography>
                    </Box>

                    <Chip
                      icon={<Euro />}
                      label={`${payment.amount} €`}
                      size="small"
                      color="success"
                      variant="filled"
                    />
                  </Box>
                  {index < payments.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 