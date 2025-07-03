import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  CalendarToday,
  TrendingUp,
  FilterList,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetTrainerTrainingsRangeQuery } from '../api/trainerApi';

type PeriodFilter = 'week' | 'month' | '3months';
type StatusFilter = 'all' | 'present' | 'absent' | 'registered';

export const TrainerAttendance: React.FC = () => {
  const [period, setPeriod] = useState<PeriodFilter>('week');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const getDateRange = (period: PeriodFilter) => {
    const end = dayjs();
    const start = period === 'week' 
      ? end.subtract(7, 'days')
      : period === 'month'
      ? end.subtract(1, 'month')
      : end.subtract(3, 'months');
    
    return {
      start_date: start.format('YYYY-MM-DD'),
      end_date: end.format('YYYY-MM-DD'),
    };
  };

  const { data: trainings, isLoading } = useGetTrainerTrainingsRangeQuery(
    getDateRange(period)
  );

  // Подсчет статистики
  const getAttendanceStats = () => {
    if (!trainings) return { total: 0, present: 0, absent: 0, registered: 0, rate: 0 };

    const allStudents = trainings.flatMap(t => t.students || []);
    const total = allStudents.length;
    const present = allStudents.filter(s => s.status === 'PRESENT').length;
    const absent = allStudents.filter(s => s.status === 'ABSENT').length;
    const registered = allStudents.filter(s => s.status === 'REGISTERED').length;
    const rate = total > 0 ? Math.round((present / (present + absent)) * 100) || 0 : 0;

    return { total, present, absent, registered, rate };
  };

  // Фильтрация студентов по статусу
  const getFilteredStudents = () => {
    if (!trainings) return [];

    const allStudents = trainings.flatMap(training => 
      (training.students || []).map(student => ({
        ...student,
        training_date: training.training_date,
        training_time: training.start_time,
        training_type: training.training_type,
      }))
    );

    if (statusFilter === 'all') return allStudents;
    return allStudents.filter(s => s.status.toLowerCase() === statusFilter.toUpperCase());
  };

  const stats = getAttendanceStats();
  const filteredStudents = getFilteredStudents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'REGISTERED': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Присутствовал';
      case 'ABSENT': return 'Отсутствовал';
      case 'REGISTERED': return 'Записан';
      case 'CANCELLED_SAFE': return 'Отменено';
      case 'CANCELLED_PENALTY': return 'Отменено (штраф)';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2, pb: 8 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          📊 Посещаемость
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Статистика и история отметок
        </Typography>
      </Box>

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

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="present">Присутствовали</MenuItem>
            <MenuItem value="absent">Отсутствовали</MenuItem>
            <MenuItem value="registered">Записаны</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {stats.present}
            </Typography>
            <Typography variant="body2">Присутствовали</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Cancel sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {stats.absent}
            </Typography>
            <Typography variant="body2">Отсутствовали</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CalendarToday sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {stats.registered}
            </Typography>
            <Typography variant="body2">Ожидают</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {stats.rate}%
            </Typography>
            <Typography variant="body2">Посещаемость</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Students List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              История отметок ({filteredStudents.length})
            </Typography>
          </Box>

          {filteredStudents.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Нет данных за выбранный период
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredStudents.map((student, index) => (
                <Box key={`${student.student_id}-${student.training_date}-${index}`}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    py: 1,
                  }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <Person fontSize="small" />
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {student.student.first_name} {student.student.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(student.training_date).format('DD.MM')} в {student.training_time?.substring(0, 5)} • {student.training_type?.name}
                      </Typography>
                    </Box>

                    <Chip
                      label={getStatusLabel(student.status)}
                      size="small"
                      color={getStatusColor(student.status) as any}
                      variant={student.status === 'REGISTERED' ? 'outlined' : 'filled'}
                    />
                  </Box>
                  {index < filteredStudents.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 