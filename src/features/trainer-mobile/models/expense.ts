export interface Expense {
  id: number;
  user_id: number;
  expense_type_id: number;
  amount: number;
  expense_date: string;
  description?: string;
} 