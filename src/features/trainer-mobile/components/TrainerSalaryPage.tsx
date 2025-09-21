import React from 'react';
import { Box, Typography, CircularProgress, List, ListItem, Paper, Divider, useTheme, alpha } from '@mui/material';
import { useGetSalaryPreviewQuery } from '../../../store/apis/trainerSalariesApi';
import dayjs from 'dayjs';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { useGradients } from '../hooks/useGradients';

const TrainerSalaryPage: React.FC = () => {
  const theme = useTheme();
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const trainerId = user?.id;
  const today = dayjs().format('YYYY-MM-DD');

  const { data: salaryPreview, isLoading, isError, error } = useGetSalaryPreviewQuery(
    { trainerId: trainerId!, previewDate: today },
    { skip: !trainerId || isLoadingUser }
  );

  const gradients = useGradients();

  if (isLoadingUser) {
    return (
      <Box sx={{ p: 2, pb: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: gradients.info, borderRadius: 3, mx: 1 }}>
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Загрузка данных...
        </Typography>
      </Box>
    );
  }

  if (!trainerId) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Typography variant="h6">Пожалуйста, войдите как тренер, чтобы просмотреть зарплату.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2, pb: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6">Загрузка предварительного просмотра зарплаты...</Typography>
      </Box>
    );
  }

  if (isError) {
    console.error('Error fetching salary preview:', error);
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Typography variant="h6">Ошибка при загрузке данных о зарплате.</Typography>
        <Typography>{(error as any)?.data?.detail || 'Произошла неожиданная ошибка.'}</Typography>
      </Box>
    );
  }

  if (!salaryPreview) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Typography variant="h6">Данные о зарплате на сегодня отсутствуют.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10, background: theme.palette.background.default, minHeight: '100%' }}>
      <Paper elevation={0} sx={{ mb: 3, p: 3, background: gradients.primary, borderRadius: 3, color: 'white' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          💼 Зарплата
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
          Предварительный расчёт заработка на сегодня
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', background: theme.palette.background.paper }}>
        <Box sx={{ p: 2, background: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Предварительный расчёт (на {dayjs().format('DD.MM.YYYY')})</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {salaryPreview.is_fixed_salary ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{'Фиксированная месячная зарплата'}</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Вы на фиксированной ставке — ежедневные выплаты не рассчитываются по тренингам.</Typography>
              <Typography variant="h3" color="primary" sx={{ mt: 2, fontWeight: 800 }}>€{salaryPreview.fixed_salary_amount?.toFixed(2) || 'N/A'}</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.06))',
                    color: theme.palette.primary.main,
                    fontWeight: 800,
                    fontSize: '1.25rem'
                  }}>💸</Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Потенциальный доход сегодня</Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Сумма всех возможных выплат за подходящие тренировки</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                    boxShadow: theme.shadows[2],
                    minWidth: 120,
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary }}>Итого</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>€{salaryPreview.potential_total_amount.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Подходящие тренировки</Typography>
              {salaryPreview.eligible_trainings.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {salaryPreview.eligible_trainings.map((training: any) => {
                    const time = training.start_time ? training.start_time.substring(0,5) : '';
                    // create initials from training name
                    const initials = (() => {
                      if (!training.training_name) return '🏋️';
                      const parts = training.training_name.split(' ');
                      if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    })();

                    return (
                      <ListItem
                        key={training.training_id}
                        disablePadding
                        sx={{
                          mb: 1,
                          p: 0,
                          borderRadius: 2,
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            background: theme.palette.background.paper,
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[3] },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                            <Box sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(25,118,210,0.12), rgba(25,118,210,0.06))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: theme.palette.primary.main,
                              flexShrink: 0,
                            }}>{initials}</Box>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {training.training_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                                ⏱ {time || '—'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                            <Box sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              background: 'linear-gradient(90deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                              color: theme.palette.success.main,
                              fontWeight: 700,
                              minWidth: 86,
                              textAlign: 'center',
                            }}>
                              €{training.potential_amount.toFixed(2)}
                            </Box>
                          </Box>
                        </Paper>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">Подходящие тренировки не найдены</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TrainerSalaryPage;
