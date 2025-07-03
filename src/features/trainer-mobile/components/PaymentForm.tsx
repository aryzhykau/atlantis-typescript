import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import {
  Person,
  Euro,
  Add as AddIcon,
  Payment as PaymentIcon,
  Close,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { TextField as FormikTextField } from 'formik-mui';
import * as Yup from 'yup';
import { useGradients } from '../hooks/useGradients';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  client?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface PaymentFormData {
  student_id: number;
  amount: string;
}

interface PaymentFormProps {
  students: Student[];
  onSubmit: (values: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
  showForm: boolean;
  onToggleForm: () => void;
}

const PaymentSchema = Yup.object({
  student_id: Yup.number().required('Выберите студента'),
  amount: Yup.number()
    .required('Введите сумму')
    .positive('Сумма должна быть больше 0')
    .min(0.01, 'Минимальная сумма 0.01 €'),
});

export const PaymentForm: React.FC<PaymentFormProps> = ({
  students,
  onSubmit,
  isLoading = false,
  showForm,
  onToggleForm,
}) => {
  const theme = useTheme();
  const gradients = useGradients();

  const handleFormSubmit = async (values: PaymentFormData, { resetForm }: any) => {
    try {
      await onSubmit(values);
      resetForm();
      onToggleForm();
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    }
  };

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
      }}
    >
      {/* Заголовок формы */}
      <Box sx={{ 
        p: 2, 
        background: alpha(theme.palette.primary.main, 0.05),
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Регистрация платежа
            </Typography>
          </Box>
          <Button
            onClick={onToggleForm}
            sx={{ 
              background: showForm ? theme.palette.primary.main : 'transparent',
              color: showForm ? 'white' : theme.palette.primary.main,
              minWidth: 'auto',
              p: 1,
              '&:hover': {
                background: showForm ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            {showForm ? <Close /> : <AddIcon />}
          </Button>
        </Box>
      </Box>

      {/* Содержимое формы */}
      {showForm && (
        <Box sx={{ p: 3 }}>
          {students.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Person sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography color="text.secondary" variant="h6">
                Нет доступных студентов
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Для регистрации платежа нужны активные студенты
              </Typography>
            </Box>
          ) : (
            <Formik
              initialValues={{
                student_id: 0,
                amount: '',
              }}
              validationSchema={PaymentSchema}
              onSubmit={handleFormSubmit}
            >
              {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={students}
                        getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Выберите студента"
                            error={touched.student_id && !!errors.student_id}
                            helperText={touched.student_id && errors.student_id}
                            size="medium"
                            fullWidth
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  background: gradients.primary,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                }}
                              >
                                {option.first_name[0]}{option.last_name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                  {option.first_name} {option.last_name}
                                </Typography>
                                {option.client && (
                                  <Typography variant="caption" color="text.secondary">
                                    Клиент: {option.client.first_name} {option.client.last_name}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        )}
                        onChange={(_, newValue) => {
                          setFieldValue('student_id', newValue?.id || 0);
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        size="medium"
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        component={FormikTextField}
                        name="amount"
                        label="Сумма платежа"
                        type="number"
                        fullWidth
                        size="medium"
                        InputProps={{
                          startAdornment: <Euro sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                          sx: { borderRadius: 2 }
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isSubmitting || isLoading || !values.student_id || !values.amount}
                        sx={{ 
                          background: gradients.success,
                          borderRadius: 2,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: theme.palette.mode === 'dark' 
                              ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                              : 'linear-gradient(135deg, #3f87fe 0%, #00d2fe 100%)',
                          },
                          '&:disabled': {
                            background: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
                            color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
                          }
                        }}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                      >
                        {isLoading ? 'Регистрация...' : 'Зарегистрировать платёж'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      )}
    </Paper>
  );
}; 