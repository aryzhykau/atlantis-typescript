

export type InvoiceStatus = "UNPAID" | "PAID" | "CANCELLED";
export type InvoiceType = "SUBSCRIPTION" | "TRAINING";

export interface IInvoiceGet {
  id: number;
  client_id: number;
  student_id: number | null;
  subscription_id: number | null;
  training_id: number | null;
  type: InvoiceType;
  amount: number;
  description: string;
  status: InvoiceStatus;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  created_by_id: number;
  cancelled_by_id: number | null;
  payment_id: number | null;
  is_auto_renewal: boolean;
}

export interface IInvoiceGetResponse {
  items: IInvoiceGet[];
  total: number;
}