export interface DashboardDebtor {
  client_id: number;
  first_name: string;
  last_name: string;
  unpaid_invoices_total: number;
  balance_credit: number;
  amount_owed: number;
}

export interface DashboardClientActiveSubscription {
  client_id: number;
  first_name: string;
  last_name: string;
  students_with_active_subscriptions: number;
  active_subscriptions_total: number;
}

export interface DashboardTrainerWorkload {
  trainer_id: number;
  first_name: string;
  last_name: string;
  trainings_count: number;
  work_days_count: number;
}

export interface OwnerDashboardResponse {
  total_clients: number;
  total_students: number;
  trainings_in_month: number;
  trainings_in_year: number;
  labels: string[];
  revenue_series: number[];
  expense_series: number[];
  trainings_series: number[];
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  avg_revenue_per_client: number;
  total_unpaid_invoices: number;
  total_outstanding_after_balance: number;
  debtors: DashboardDebtor[];
  debtors_count: number;
  active_student_subscriptions: number;
  students_with_active_subscriptions_count: number;
  clients_with_active_subscriptions_count: number;
  clients_with_active_subscriptions: DashboardClientActiveSubscription[];
  trainings_per_trainer: DashboardTrainerWorkload[];
  trainers_count: number;
  trainers_with_workdays_count: number;
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  interval?: "day" | "week" | "month";
}
