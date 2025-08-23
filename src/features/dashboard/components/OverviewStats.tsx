import React from 'react';
import { Box, Grid, Paper, Typography, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import CountedPanel from './CountedPanel';
import { useGetOverviewStatsQuery } from '../../../store/apis/statsApi';

export const OverviewStats: React.FC = () => {
  const [interval, setInterval] = React.useState<'day' | 'week' | 'month'>('month');
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);
  const { data } = useGetOverviewStatsQuery({ start_date: startDate, end_date: endDate, interval });

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <ToggleButtonGroup size="small" value={interval} exclusive onChange={(_, v) => v && setInterval(v)}>
            <ToggleButton value="day">Дни</ToggleButton>
            <ToggleButton value="week">Недели</ToggleButton>
            <ToggleButton value="month">Месяцы</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          <TextField type="date" size="small" label="Начало" InputLabelProps={{ shrink: true }} value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value || undefined)} />
        </Grid>
        <Grid item>
          <TextField type="date" size="small" label="Конец" InputLabelProps={{ shrink: true }} value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value || undefined)} />
        </Grid>
      </Grid>

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
              series={[{ data: data?.revenue_series ?? [], label: 'Прибыль, €', color: '#2e7d32' }]}
              xAxis={[{ scaleType: 'point', data: data?.labels ?? [] }]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Расходы по месяцам</Typography>
            <LineChart
              height={260}
              series={[{ data: data?.expense_series ?? [], label: 'Расходы, €', color: '#c62828' }]}
              xAxis={[{ scaleType: 'point', data: data?.labels ?? [] }]}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Тренировок по месяцам</Typography>
            <LineChart
              height={260}
              series={[{ data: data?.trainings_series ?? [], label: 'Тренировок', color: '#1565c0' }]}
              xAxis={[{ scaleType: 'point', data: data?.labels ?? [] }]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewStats;


