import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LineChart, BarChart } from "@mui/x-charts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { MobilePageShell, MetricPillCard, SectionCard } from "../../../components/mobile-kit";
import { useGradients } from "../../trainer-mobile/hooks/useGradients";
import { useGetOwnerDashboardQuery } from "../../../store/apis/dashboardApi";

const asCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value ?? 0);

export function OwnerDashboardMobile() {
  const gradients = useGradients();
  const [interval, setInterval] = React.useState<"day" | "week" | "month">("month");
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useGetOwnerDashboardQuery({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  const topDebtors = (data?.debtors ?? []).slice(0, 5);
  const topTrainers = (data?.trainings_per_trainer ?? []).slice(0, 5);

  return (
    <MobilePageShell
      title="Дашборд"
      subtitle="Ключевые метрики бизнеса"
      icon={<DashboardIcon />}
      heroGradient={gradients.primary}
      actions={
        <IconButton aria-label="refresh-dashboard" onClick={() => refetch()}>
          <DateRangeIcon sx={{ color: "white" }} />
        </IconButton>
      }
      stats={
        <Grid container spacing={1.25}>
          <Grid item xs={6}>
            <MetricPillCard label="Клиенты" value={data?.total_clients ?? 0} gradient={gradients.primary} />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard label="Ученики" value={data?.total_students ?? 0} gradient={gradients.info} />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard label="Долг (чистый)" value={asCurrency(data?.total_outstanding_after_balance ?? 0)} gradient={gradients.warning} />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard label="Активные абонементы" value={data?.active_student_subscriptions ?? 0} gradient={gradients.success} />
          </Grid>
        </Grid>
      }
    >
      <SectionCard title="Период">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <ToggleButtonGroup size="small" value={interval} exclusive onChange={(_, v) => v && setInterval(v)}>
            <ToggleButton value="day">Дни</ToggleButton>
            <ToggleButton value="week">Недели</ToggleButton>
            <ToggleButton value="month">Месяцы</ToggleButton>
          </ToggleButtonGroup>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Начало"
                InputLabelProps={{ shrink: true }}
                value={startDate ?? ""}
                onChange={(e) => setStartDate(e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Конец"
                InputLabelProps={{ shrink: true }}
                value={endDate ?? ""}
                onChange={(e) => setEndDate(e.target.value || undefined)}
              />
            </Grid>
          </Grid>
        </Box>
      </SectionCard>

      {isError ? <Alert severity="error">Не удалось загрузить дашборд</Alert> : null}
      {isLoading ? (
        <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!isLoading ? (
        <>
          <SectionCard title="Выручка и расходы">
            <LineChart
              height={220}
              series={[
                { data: data?.revenue_series ?? [], label: "Выручка", color: "#2e7d32" },
                { data: data?.expense_series ?? [], label: "Расходы", color: "#c62828" },
              ]}
              xAxis={[{ scaleType: "point", data: data?.labels ?? [] }]}
            />
          </SectionCard>

          <SectionCard title="Топ должников">
            <BarChart
              height={220}
              xAxis={[{ scaleType: "band", data: topDebtors.map((d) => d.first_name) }]}
              series={[{ data: topDebtors.map((d) => d.amount_owed), label: "Долг", color: "#ef6c00" }]}
            />
            <List dense>
              {topDebtors.map((debtor) => (
                <ListItem key={debtor.client_id} disableGutters>
                  <ListItemText
                    primary={`${debtor.first_name} ${debtor.last_name}`}
                    secondary={`Долг: ${asCurrency(debtor.amount_owed)}`}
                  />
                </ListItem>
              ))}
            </List>
          </SectionCard>

          <SectionCard title="Тренеры: рабочие дни">
            <List dense>
              {topTrainers.map((trainer) => (
                <ListItem key={trainer.trainer_id} disableGutters>
                  <ListItemText
                    primary={`${trainer.first_name} ${trainer.last_name}`}
                    secondary={`Тренировок: ${trainer.trainings_count} • Рабочих дней: ${trainer.work_days_count}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" color="text.secondary">
              Тренеры с рабочими днями: {data?.trainers_with_workdays_count ?? 0}
            </Typography>
          </SectionCard>
        </>
      ) : null}
    </MobilePageShell>
  );
}
