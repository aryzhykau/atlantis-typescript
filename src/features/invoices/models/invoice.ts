import {IClientGet} from "../../clients/models/client.ts";

export interface IInvoiceGet {
  amount: number;
  client_subscription_id: number;
  created_at: string;
  paid_at: string | null;
  invoice_type: string;
  id: number;
  user: IClientGet;
}