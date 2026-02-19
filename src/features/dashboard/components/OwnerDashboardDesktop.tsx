import React from "react";
import {
  Alert,
  Box,
  Button,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useGradients } from "../../trainer-mobile/hooks/useGradients";
import { useGetOwnerDashboardQuery } from "../../../store/apis/dashboardApi";

const LAYOUT_STORAGE_KEY = "owner_dashboard_layout_v2";

type WidgetId =
  | "kpi_clients"
  | "kpi_students"
  | "kpi_outstanding"
  | "kpi_unpaid"
  | "kpi_subscriptions"
  | "kpi_trainers_workdays"
  | "chart_financial"
  | "chart_trainings"
  | "chart_debtors"
  | "chart_trainers"
  | "summary_period"
  | "list_debtors"
  | "list_trainers_workdays"
  | "list_clients_active_subscriptions";

type WidgetSizeKey = "sm" | "md" | "lg" | "xl" | "full";

type LayoutItem = {
  id: WidgetId;
  size: WidgetSizeKey;
};

type SizePreset = { label: string; cols: number; rows: number };

const SIZE_PRESETS: Record<WidgetSizeKey, SizePreset> = {
  sm: { label: "S", cols: 3, rows: 1 },
  md: { label: "M", cols: 4, rows: 1 },
  lg: { label: "L", cols: 6, rows: 1 },
  xl: { label: "XL", cols: 6, rows: 2 },
  full: { label: "Full", cols: 12, rows: 2 },
};

const SIZE_PRESET_ENTRIES = Object.entries(SIZE_PRESETS) as [WidgetSizeKey, SizePreset][];

const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: "kpi_clients", size: "sm" },
  { id: "kpi_students", size: "sm" },
  { id: "kpi_outstanding", size: "sm" },
  { id: "kpi_unpaid", size: "sm" },
  { id: "kpi_subscriptions", size: "sm" },
  { id: "kpi_trainers_workdays", size: "sm" },
  { id: "chart_financial", size: "xl" },
  { id: "summary_period", size: "lg" },
  { id: "chart_trainings", size: "lg" },
  { id: "chart_debtors", size: "xl" },
  { id: "chart_trainers", size: "xl" },
  { id: "list_debtors", size: "full" },
  { id: "list_trainers_workdays", size: "full" },
  { id: "list_clients_active_subscriptions", size: "full" },
];

type ResizeState = {
  widgetId: WidgetId;
  startX: number;
  startY: number;
  startCols: number;
  startRows: number;
};

const asCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value ?? 0);

const normalizeSeries = (values: number[] | undefined, len: number) => {
  const source = values ?? [];
  if (source.length >= len) return source.slice(0, len);
  return [...source, ...new Array(Math.max(len - source.length, 0)).fill(0)];
};

const loadLayout = (): LayoutItem[] => {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (!raw) return DEFAULT_LAYOUT;
  try {
    const parsed = JSON.parse(raw) as LayoutItem[];
    const ids = new Set(DEFAULT_LAYOUT.map((item) => item.id));
    const safe = parsed.filter((item) => ids.has(item.id) && item.size in SIZE_PRESETS);
    const missing = DEFAULT_LAYOUT.filter((item) => !safe.some((s) => s.id === item.id));
    return [...safe, ...missing];
  } catch {
    return DEFAULT_LAYOUT;
  }
};

const getNearestSizeByGrid = (targetCols: number, targetRows: number): WidgetSizeKey => {
  let best: WidgetSizeKey = "md";
  let bestScore = Number.POSITIVE_INFINITY;
  for (const [key, preset] of SIZE_PRESET_ENTRIES) {
    const score = Math.abs(preset.cols - targetCols) * 2 + Math.abs(preset.rows - targetRows) * 3;
    if (score < bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; gradient: string }> = ({
  title,
  value,
  icon,
  gradient,
}) => (
  <Paper
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 3,
      p: 2,
      color: "white",
      background: gradient,
      border: "1px solid rgba(255,255,255,0.2)",
      minHeight: 110,
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

const WidgetFrame: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  editMode: boolean;
}> = ({ title, subtitle, children, editMode }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {editMode ? (
        <Box sx={{ color: "text.secondary", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <DragIndicatorIcon fontSize="small" />
          <Typography variant="caption">Drag</Typography>
        </Box>
      ) : null}
    </Box>
    {children}
  </Paper>
);

export function OwnerDashboardDesktop() {
  const gradients = useGradients();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const [interval, setInterval] = React.useState<"day" | "week" | "month">("month");
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);
  const [editMode, setEditMode] = React.useState(false);
  const [layout, setLayout] = React.useState<LayoutItem[]>(loadLayout);
  const [draggedWidgetId, setDraggedWidgetId] = React.useState<WidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = React.useState<WidgetId | null>(null);
  const [resizingWidgetId, setResizingWidgetId] = React.useState<WidgetId | null>(null);
  const [cornerHandleWidgetId, setCornerHandleWidgetId] = React.useState<WidgetId | null>(null);
  const resizeRef = React.useRef<ResizeState | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetOwnerDashboardQuery({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    }
  }, [layout]);

  React.useEffect(() => {
    if (!editMode) {
      setCornerHandleWidgetId(null);
      setResizingWidgetId(null);
      resizeRef.current = null;
    }
  }, [editMode]);

  const labels = data?.labels ?? [];
  const revenueSeries = normalizeSeries(data?.revenue_series, labels.length);
  const expenseSeries = normalizeSeries(data?.expense_series, labels.length);
  const trainingsSeries = normalizeSeries(data?.trainings_series, labels.length);

  const topDebtors = React.useMemo(() => (data?.debtors ?? []).slice(0, 10), [data?.debtors]);
  const topTrainers = React.useMemo(() => (data?.trainings_per_trainer ?? []).slice(0, 10), [data?.trainings_per_trainer]);

  const reorderByDrop = (targetWidgetId: WidgetId) => {
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;
    setLayout((prev) => {
      const dragIndex = prev.findIndex((item) => item.id === draggedWidgetId);
      const targetIndex = prev.findIndex((item) => item.id === targetWidgetId);
      if (dragIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const setWidgetSize = React.useCallback((widgetId: WidgetId, size: WidgetSizeKey) => {
    setLayout((prev) => prev.map((item) => (item.id === widgetId ? { ...item, size } : item)));
  }, []);

  const startResize = (widgetId: WidgetId, event: React.MouseEvent) => {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    const item = layout.find((x) => x.id === widgetId);
    if (!item) return;
    const preset = SIZE_PRESETS[item.size];
    resizeRef.current = {
      widgetId,
      startX: event.clientX,
      startY: event.clientY,
      startCols: preset.cols,
      startRows: preset.rows,
    };
    setResizingWidgetId(widgetId);
    setCornerHandleWidgetId(widgetId);
  };

  React.useEffect(() => {
    if (!resizingWidgetId) return;
    const onMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = event.clientX - resizeRef.current.startX;
      const dy = event.clientY - resizeRef.current.startY;
      const targetCols = Math.max(3, Math.min(12, Math.round(resizeRef.current.startCols + dx / 120)));
      let targetRows = resizeRef.current.startRows;
      if (dy > 80) targetRows = 2;
      if (dy < -80) targetRows = 1;
      const nextSize = getNearestSizeByGrid(targetCols, targetRows);
      setWidgetSize(resizeRef.current.widgetId, nextSize);
    };
    const onUp = () => {
      resizeRef.current = null;
      setResizingWidgetId(null);
      setCornerHandleWidgetId(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizingWidgetId, setWidgetSize]);

  const renderWidgetContent = (item: LayoutItem) => {
    const preset = SIZE_PRESETS[item.size];
    const chartHeight = preset.rows >= 2 ? 320 : 220;
    switch (item.id) {
      case "kpi_clients":
        return <StatCard title="Клиенты" value={data?.total_clients ?? 0} icon={<GroupIcon />} gradient={gradients.primary} />;
      case "kpi_students":
        return <StatCard title="Ученики" value={data?.total_students ?? 0} icon={<SchoolIcon />} gradient={gradients.info} />;
      case "kpi_outstanding":
        return (
          <StatCard
            title="Долг (чистый)"
            value={asCurrency(data?.total_outstanding_after_balance ?? 0)}
            icon={<EventBusyIcon />}
            gradient={gradients.warning}
          />
        );
      case "kpi_unpaid":
        return (
          <StatCard
            title="Неоплачено инвойсов"
            value={asCurrency(data?.total_unpaid_invoices ?? 0)}
            icon={<AccountBalanceWalletIcon />}
            gradient={gradients.error}
          />
        );
      case "kpi_subscriptions":
        return (
          <StatCard
            title="Активные абонементы"
            value={data?.active_student_subscriptions ?? 0}
            icon={<CardMembershipIcon />}
            gradient={gradients.success}
          />
        );
      case "kpi_trainers_workdays":
        return (
          <StatCard
            title="Тренеры с рабочими днями"
            value={data?.trainers_with_workdays_count ?? 0}
            icon={<FitnessCenterIcon />}
            gradient={gradients.info}
          />
        );
      case "chart_financial":
        return (
          <WidgetFrame title="Выручка и расходы" subtitle="Динамика за выбранный период" editMode={editMode}>
            <LineChart
              height={chartHeight}
              series={[
                { data: revenueSeries, label: "Выручка, €", color: "#2e7d32" },
                { data: expenseSeries, label: "Расходы, €", color: "#c62828" },
              ]}
              xAxis={[{ scaleType: "point", data: labels }]}
            />
          </WidgetFrame>
        );
      case "chart_trainings":
        return (
          <WidgetFrame title="Тренировки" subtitle="Тренировки по выбранным интервалам" editMode={editMode}>
            <LineChart
              height={chartHeight}
              series={[{ data: trainingsSeries, label: "Тренировки", color: "#1565c0" }]}
              xAxis={[{ scaleType: "point", data: labels }]}
            />
          </WidgetFrame>
        );
      case "chart_debtors":
        return (
          <WidgetFrame title="Топ должников" subtitle="Сумма долга после учета баланса" editMode={editMode}>
            <BarChart
              height={chartHeight}
              xAxis={[{ scaleType: "band", data: topDebtors.map((d) => `${d.first_name} ${d.last_name}`) }]}
              series={[{ data: topDebtors.map((d) => d.amount_owed), label: "Долг, €", color: "#ef6c00" }]}
            />
          </WidgetFrame>
        );
      case "chart_trainers":
        return (
          <WidgetFrame title="Тренеры: тренировки и рабочие дни" editMode={editMode}>
            <BarChart
              height={chartHeight}
              xAxis={[{ scaleType: "band", data: topTrainers.map((t) => `${t.first_name} ${t.last_name}`) }]}
              series={[
                { data: topTrainers.map((t) => t.trainings_count), label: "Тренировки", color: "#1565c0" },
                { data: topTrainers.map((t) => t.work_days_count), label: "Рабочие дни", color: "#2e7d32" },
              ]}
            />
          </WidgetFrame>
        );
      case "summary_period":
        return (
          <WidgetFrame title="Итоги периода" editMode={editMode}>
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
              {trainingsSeries.reduce((acc, value) => acc + value, 0)}
            </Typography>
          </WidgetFrame>
        );
      case "list_debtors":
        return (
          <WidgetFrame title="Список должников" subtitle="Все клиенты, у кого есть долг" editMode={editMode}>
            <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Клиент</TableCell>
                    <TableCell align="right">Неоплаченные</TableCell>
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
          </WidgetFrame>
        );
      case "list_trainers_workdays":
        return (
          <WidgetFrame title="Список тренеров и рабочих дней" subtitle="Уникальные даты тренировок по каждому тренеру" editMode={editMode}>
            <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Тренер</TableCell>
                    <TableCell align="right">Тренировок</TableCell>
                    <TableCell align="right">Рабочих дней</TableCell>
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
          </WidgetFrame>
        );
      case "list_clients_active_subscriptions":
        return (
          <WidgetFrame title="Клиенты с активными абонементами" editMode={editMode}>
            <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Клиент</TableCell>
                    <TableCell align="right">Активных абонементов</TableCell>
                    <TableCell align="right">Учеников с активными</TableCell>
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
          </WidgetFrame>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: "100%", minHeight: 0, overflowY: "auto", pr: 1 }}>
      <Box display="flex" flexDirection="column" gap={2} pb={1.5}>
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
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Дашборд владельца
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Финансы, долги клиентов, активные абонементы и нагрузка тренеров
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="contained"
                color="inherit"
                startIcon={editMode ? <DoneIcon /> : <EditIcon />}
                onClick={() => setEditMode((prev) => !prev)}
              >
                {editMode ? "Готово" : "Редактировать"}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={() => setLayout(DEFAULT_LAYOUT)}
              >
                Сбросить
              </Button>
            </Box>
          </Box>
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
          {editMode ? (
            <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.95 }}>
              Перетаскивайте карточки для изменения порядка. Тяните за угол справа снизу для изменения размера.
            </Typography>
          ) : null}
        </Paper>

        {isError ? (
          <Alert
            severity="error"
            action={
              <Typography sx={{ cursor: "pointer" }} onClick={() => refetch()}>
                Повторить
              </Typography>
            }
          >
            Не удалось загрузить дашборд
          </Alert>
        ) : null}

        {isLoading ? (
          <Box sx={{ py: 10, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isCompact ? "repeat(1, minmax(0, 1fr))" : "repeat(12, minmax(0, 1fr))",
              gap: 2,
              gridAutoFlow: "dense",
            }}
          >
            {layout.map((item) => {
              const preset = SIZE_PRESETS[item.size];
              const widgetStyle = isCompact
                ? { gridColumn: "1 / -1" }
                : { gridColumn: `span ${preset.cols}`, gridRow: `span ${preset.rows}` };
              const isDragOver = editMode && dragOverWidgetId === item.id && draggedWidgetId !== item.id;

              return (
                <Box
                  key={item.id}
                  sx={{
                    ...widgetStyle,
                    position: "relative",
                    cursor: editMode ? "grab" : "default",
                    opacity: draggedWidgetId === item.id ? 0.65 : 1,
                    outline: isDragOver ? `2px dashed ${theme.palette.primary.main}` : "none",
                    outlineOffset: 2,
                    borderRadius: 3,
                  }}
                  draggable={editMode}
                  onDragStart={() => setDraggedWidgetId(item.id)}
                  onDragOver={(event) => {
                    if (!editMode) return;
                    event.preventDefault();
                    setDragOverWidgetId(item.id);
                  }}
                  onDrop={(event) => {
                    if (!editMode) return;
                    event.preventDefault();
                    reorderByDrop(item.id);
                    setDraggedWidgetId(null);
                    setDragOverWidgetId(null);
                    setCornerHandleWidgetId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedWidgetId(null);
                    setDragOverWidgetId(null);
                    setCornerHandleWidgetId(null);
                  }}
                  onMouseMove={(event) => {
                    if (!editMode || resizingWidgetId) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const nearCorner = event.clientX >= rect.right - 56 && event.clientY >= rect.bottom - 56;
                    setCornerHandleWidgetId((prev) => (nearCorner ? item.id : prev === item.id ? null : prev));
                  }}
                  onMouseLeave={() => {
                    setCornerHandleWidgetId((prev) => (prev === item.id ? null : prev));
                  }}
                >
                  {renderWidgetContent(item)}
                  {editMode && (cornerHandleWidgetId === item.id || resizingWidgetId === item.id) ? (
                    <Box
                      onMouseDown={(event) => startResize(item.id, event)}
                      sx={{
                        position: "absolute",
                        right: -3,
                        bottom: -3,
                        width: 32,
                        height: 32,
                        cursor: "nwse-resize",
                        zIndex: 3,
                        transition: "opacity 0.15s ease, transform 0.12s ease",
                        opacity: resizingWidgetId === item.id ? 1 : 0.95,
                        "&:hover": {
                          transform: "scale(1.03)",
                        },
                        "&:active": {
                          transform: "scale(0.99)",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          width: 32,
                          height: 32,
                          borderRight: "5px solid rgba(255,255,255,0.98)",
                          borderBottom: "5px solid rgba(255,255,255,0.98)",
                          borderBottomRightRadius: 14,
                        },
                      }}
                    />
                  ) : null}
                  {resizingWidgetId === item.id ? (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 3,
                        border: `2px solid ${theme.palette.primary.main}`,
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                </Box>
              );
            })}
          </Box>
        )}

        {isFetching && !isLoading ? (
          <Typography variant="caption" color="text.secondary">
            Обновление данных...
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
