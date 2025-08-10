import React from 'react';
import { Box, Grid, Paper, Typography, alpha, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import CountedPanel from './CountedPanel';
import { useGetOverviewStatsQuery } from '../../../store/apis/statsApi';

export const OverviewStats: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data } = useGetOverviewStatsQuery();

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item>
          <CountedPanel data={data?.total_clients ?? 0} headerLines={["Всего", "Клиентов"]} />
        </Grid>
        <Grid item>
          <CountedPanel data={data?.total_students ?? 0} headerLines={["Всего", "Учеников"]} />
        </Grid>
        <Grid item>
          <CountedPanel data={data?.new_clients_month ?? 0} headerLines={["Новых", "Клиентов"]} />
        </Grid>
        <Grid item>
          <CountedPanel data={data?.trainings_in_month ?? 0} headerLines={["Тренировок", "За месяц"]} />
        </Grid>
        <Grid item>
          <CountedPanel data={data?.trainings_in_year ?? 0} headerLines={["Тренировок", "За год"]} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Прибыль по месяцам</Typography>
            <LineChart
              height={260}
              series={[{ data: data?.revenue_by_month ?? [], label: 'Прибыль, €', color: '#2e7d32' }]}
              xAxis={[{ scaleType: 'point', data: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'] }]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Расходы по месяцам</Typography>
            <LineChart
              height={260}
              series={[{ data: data?.expense_by_month ?? [], label: 'Расходы, €', color: '#c62828' }]}
              xAxis={[{ scaleType: 'point', data: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'] }]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Тренировок по месяцам</Typography>
            <LineChart
              height={260}
              series={[{ data: data?.trainings_by_month ?? [], label: 'Тренировок', color: '#1565c0' }]}
              xAxis={[{ scaleType: 'point', data: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'] }]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewStats;


