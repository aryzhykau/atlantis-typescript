import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LineChart, BarChart } from "@mui/x-charts";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useGradients } from "../../trainer-mobile/hooks/useGradients";
import { useGetOwnerDashboardQuery } from "../../../store/apis/dashboardApi";

const asCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value ?? 0);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, value, icon, gradient }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      p: 2,
      color: "white",
      background: gradient,
      border: "1px solid rgba(255,255,255,0.2)",
      minHeight: 120,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "white" }}>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
      {value}
    </Typography>
  </Paper>
);

const CardFrame: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
    <Typography variant="h6" sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {subtitle}
      </Typography>
    ) : null}
    {children}
  </Paper>
);

export function OwnerDashboardDesktop() {
  const gradients = useGradients();
  const [interval, setInterval] = React.useState<"day" | "week" | "month">("month");
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, isError, refetch } = useGetOwnerDashboardQuery({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  const topDebtors = React.useMemo(() => (data?.debtors ?? []).slice(0, 8), [data?.debtors]);
  const topTrainers = React.useMemo(() => (data?.trainings_per_trainer ?? []).slice(0, 10), [data?.trainings_per_trainer]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: gradients.primary,
          color: "white",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Дашборд владельца
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Финансы, долги клиентов, активные абонементы и нагрузка тренеров
        </Typography>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item>
            <ToggleButtonGroup
              size="small"
              value={interval}
              exclusive
              onChange={(_, v) => v && setInterval(v)}
              sx={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 2,
                "& .MuiToggleButton-root": { color: "white", borderColor: "rgba(255,255,255,0.25)" },
                "& .Mui-selected": { background: "rgba(255,255,255,0.3) !important" },
              }}
            >
              <ToggleButton value="day">Дни</ToggleButton>
              <ToggleButton value="week">Недели</ToggleButton>
              <ToggleButton value="month">Месяцы</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              size="small"
              label="Начало"
              InputLabelProps={{ shrink: true }}
              value={startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value || undefined)}
              sx={{ background: "rgba(255,255,255,0.14)", borderRadius: 2 }}
            />
          </Grid>
          <Grid item>
            <TextField
              type="date"
              size="small"
              label="Конец"
              InputLabelProps={{ shrink: true }}
              value={endDate ?? ""}
              onChange={(e) => setEndDate(e.target.value || undefined)}
              sx={{ background: "rgba(255,255,255,0.14)", borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {isError ? (
        <Alert severity="error" action={<Typography sx={{ cursor: "pointer" }} onClick={() => refetch()}>Повторить</Typography>}>
          Не удалось загрузить дашборд
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ py: 10, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Клиенты" value={data?.total_clients ?? 0} icon={<GroupIcon />} gradient={gradients.primary} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Ученики" value={data?.total_students ?? 0} icon={<SchoolIcon />} gradient={gradients.info} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Долг (чистый)" value={asCurrency(data?.total_outstanding_after_balance ?? 0)} icon={<EventBusyIcon />} gradient={gradients.warning} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Неоплачено инвойсов" value={asCurrency(data?.total_unpaid_invoices ?? 0)} icon={<AccountBalanceWalletIcon />} gradient={gradients.error} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Активные абонементы" value={data?.active_student_subscriptions ?? 0} icon={<CardMembershipIcon />} gradient={gradients.success} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard title="Тренеры с рабочими днями" value={data?.trainers_with_workdays_count ?? 0} icon={<FitnessCenterIcon />} gradient={gradients.info} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <CardFrame title="Выручка и расходы" subtitle="Динамика за выбранный период">
                <LineChart
                  height={280}
                  series={[
                    { data: data?.revenue_series ?? [], label: "Выручка, €", color: "#2e7d32" },
                    { data: data?.expense_series ?? [], label: "Расходы, €", color: "#c62828" },
                  ]}
                  xAxis={[{ scaleType: "point", data: data?.labels ?? [] }]}
                />
              </CardFrame>
            </Grid>
            <Grid item xs={12} md={4}>
              <CardFrame title="Итоги периода">
                <Typography variant="body2" color="text.secondary">
                  Чистая прибыль
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  {asCurrency(data?.net_profit ?? 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Выручка
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {asCurrency(data?.total_revenue ?? 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Расходы
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {asCurrency(data?.total_expenses ?? 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Тренировок за период
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {(data?.trainings_series ?? []).reduce((acc, value) => acc + value, 0)}
                </Typography>
              </CardFrame>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CardFrame title="Топ должников" subtitle="Сумма долга после учета баланса">
                <BarChart
                  height={280}
                  xAxis={[{ scaleType: "band", data: topDebtors.map((d) => `${d.first_name} ${d.last_name}`) }]}
                  series={[{ data: topDebtors.map((d) => d.amount_owed), label: "Долг, €", color: "#ef6c00" }]}
                />
              </CardFrame>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardFrame title="Тренеры: тренировки и рабочие дни">
                <BarChart
                  height={280}
                  xAxis={[{ scaleType: "band", data: topTrainers.map((t) => `${t.first_name} ${t.last_name}`) }]}
                  series={[
                    { data: topTrainers.map((t) => t.trainings_count), label: "Тренировки", color: "#1565c0" },
                    { data: topTrainers.map((t) => t.work_days_count), label: "Рабочие дни", color: "#2e7d32" },
                  ]}
                />
              </CardFrame>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CardFrame title="Клиенты с активными абонементами">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Клиент</TableCell>
                      <TableCell align="right">Активных абонементов</TableCell>
                      <TableCell align="right">Учеников с активными</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.clients_with_active_subscriptions ?? []).slice(0, 12).map((client) => (
                      <TableRow key={client.client_id}>
                        <TableCell>{client.first_name} {client.last_name}</TableCell>
                        <TableCell align="right">{client.active_subscriptions_total}</TableCell>
                        <TableCell align="right">{client.students_with_active_subscriptions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardFrame>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardFrame title="Детализация должников">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Клиент</TableCell>
                      <TableCell align="right">Неоплаченные</TableCell>
                      <TableCell align="right">Баланс</TableCell>
                      <TableCell align="right">Долг</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.debtors ?? []).slice(0, 12).map((debtor) => (
                      <TableRow key={debtor.client_id}>
                        <TableCell>{debtor.first_name} {debtor.last_name}</TableCell>
                        <TableCell align="right">{asCurrency(debtor.unpaid_invoices_total)}</TableCell>
                        <TableCell align="right">{asCurrency(debtor.balance_credit)}</TableCell>
                        <TableCell align="right">{asCurrency(debtor.amount_owed)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardFrame>
            </Grid>
          </Grid>
        </>
      )}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary">
          Обновление данных...
        </Typography>
      ) : null}
    </Box>
  );
}
