import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
import { BarChart, LineChart } from "@mui/x-charts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import { MobilePageShell, MetricPillCard, SectionCard } from "../../../components/mobile-kit";
import { useGradients } from "../../trainer-mobile/hooks/useGradients";
import { useGetOwnerDashboardQuery } from "../../../store/apis/dashboardApi";

const asCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value ?? 0);

const normalizeSeries = (values: number[] | undefined, len: number) => {
  const source = values ?? [];
  if (source.length >= len) return source.slice(0, len);
  return [...source, ...new Array(Math.max(len - source.length, 0)).fill(0)];
};

export function OwnerDashboardMobile() {
  const gradients = useGradients();
  const [interval, setInterval] = React.useState<"day" | "week" | "month">("month");
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<string>("overview");

  const { data, isLoading, isError, refetch } = useGetOwnerDashboardQuery({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  const labels = data?.labels ?? [];
  const revenueSeries = normalizeSeries(data?.revenue_series, labels.length);
  const expenseSeries = normalizeSeries(data?.expense_series, labels.length);
  const trainingsSeries = normalizeSeries(data?.trainings_series, labels.length);

  const topDebtors = (data?.debtors ?? []).slice(0, 8);
  const topTrainers = (data?.trainings_per_trainer ?? []).slice(0, 8);

  const handleAccordion =
    (panel: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : "");
    };

  return (
    <MobilePageShell
      title="Дашборд"
      subtitle="Полная картина бизнеса"
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
            <MetricPillCard label="Клиенты" value={data?.total_clients ?? 0} gradient={gradients.primary} icon={<GroupIcon fontSize="small" />} />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard label="Ученики" value={data?.total_students ?? 0} gradient={gradients.info} icon={<SchoolIcon fontSize="small" />} />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard
              label="Долг (чистый)"
              value={asCurrency(data?.total_outstanding_after_balance ?? 0)}
              gradient={gradients.warning}
              icon={<EventBusyIcon fontSize="small" />}
            />
          </Grid>
          <Grid item xs={6}>
            <MetricPillCard
              label="Активные абонементы"
              value={data?.active_student_subscriptions ?? 0}
              gradient={gradients.success}
              icon={<CardMembershipIcon fontSize="small" />}
            />
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Accordion expanded={expanded === "overview"} onChange={handleAccordion("overview")} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Финансовый обзор</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SectionCard title="Выручка и расходы">
                <LineChart
                  height={220}
                  series={[
                    { data: revenueSeries, label: "Выручка", color: "#2e7d32" },
                    { data: expenseSeries, label: "Расходы", color: "#c62828" },
                  ]}
                  xAxis={[{ scaleType: "point", data: labels }]}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Чистая прибыль: <strong>{asCurrency(data?.net_profit ?? 0)}</strong></Typography>
                  <Typography variant="body2">Выручка: <strong>{asCurrency(data?.total_revenue ?? 0)}</strong></Typography>
                  <Typography variant="body2">Расходы: <strong>{asCurrency(data?.total_expenses ?? 0)}</strong></Typography>
                </Box>
              </SectionCard>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === "trainings"} onChange={handleAccordion("trainings")} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Тренировки и нагрузка</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SectionCard title="Динамика тренировок">
                <LineChart
                  height={220}
                  series={[{ data: trainingsSeries, label: "Тренировки", color: "#1565c0" }]}
                  xAxis={[{ scaleType: "point", data: labels }]}
                />
              </SectionCard>
              <Box sx={{ height: 12 }} />
              <SectionCard title="Топ тренеров по нагрузке">
                <BarChart
                  height={220}
                  xAxis={[{ scaleType: "band", data: topTrainers.map((t) => t.first_name) }]}
                  series={[
                    { data: topTrainers.map((t) => t.trainings_count), label: "Тренировки", color: "#1565c0" },
                    { data: topTrainers.map((t) => t.work_days_count), label: "Дни", color: "#2e7d32" },
                  ]}
                />
              </SectionCard>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === "debtors"} onChange={handleAccordion("debtors")} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Долги клиентов</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SectionCard title="Топ должников">
                <BarChart
                  height={220}
                  xAxis={[{ scaleType: "band", data: topDebtors.map((d) => d.first_name) }]}
                  series={[{ data: topDebtors.map((d) => d.amount_owed), label: "Долг", color: "#ef6c00" }]}
                />
              </SectionCard>
              <Box sx={{ height: 12 }} />
              <SectionCard title="Полный список должников">
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Клиент</TableCell>
                        <TableCell align="right">Неоплач.</TableCell>
                        <TableCell align="right">Баланс</TableCell>
                        <TableCell align="right">Долг</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data?.debtors ?? []).map((debtor) => (
                        <TableRow key={debtor.client_id}>
                          <TableCell>{debtor.first_name} {debtor.last_name}</TableCell>
                          <TableCell align="right">{asCurrency(debtor.unpaid_invoices_total)}</TableCell>
                          <TableCell align="right">{asCurrency(debtor.balance_credit)}</TableCell>
                          <TableCell align="right">{asCurrency(debtor.amount_owed)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </SectionCard>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === "subscriptions"} onChange={handleAccordion("subscriptions")} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Активные абонементы</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SectionCard title="Итоги по абонементам">
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="Активных абонементов" secondary={data?.active_student_subscriptions ?? 0} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="Учеников с активными абонементами" secondary={data?.students_with_active_subscriptions_count ?? 0} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="Клиентов с активными абонементами" secondary={data?.clients_with_active_subscriptions_count ?? 0} />
                  </ListItem>
                </List>
              </SectionCard>
              <Box sx={{ height: 12 }} />
              <SectionCard title="Клиенты с активными абонементами">
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Клиент</TableCell>
                        <TableCell align="right">Активн.</TableCell>
                        <TableCell align="right">Ученики</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data?.clients_with_active_subscriptions ?? []).map((client) => (
                        <TableRow key={client.client_id}>
                          <TableCell>{client.first_name} {client.last_name}</TableCell>
                          <TableCell align="right">{client.active_subscriptions_total}</TableCell>
                          <TableCell align="right">{client.students_with_active_subscriptions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </SectionCard>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === "trainers_list"} onChange={handleAccordion("trainers_list")} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Список тренеров и рабочих дней</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SectionCard title="Все тренеры">
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Тренер</TableCell>
                        <TableCell align="right">Тренир.</TableCell>
                        <TableCell align="right">Дни</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data?.trainings_per_trainer ?? []).map((trainer) => (
                        <TableRow key={trainer.trainer_id}>
                          <TableCell>{trainer.first_name} {trainer.last_name}</TableCell>
                          <TableCell align="right">{trainer.trainings_count}</TableCell>
                          <TableCell align="right">{trainer.work_days_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </SectionCard>
            </AccordionDetails>
          </Accordion>
        </Box>
      ) : null}
    </MobilePageShell>
  );
}
