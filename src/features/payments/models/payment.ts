import dayjs from "dayjs";

export interface IPayment {
    client_id: number;
    description: string;
    amount: number;
}

export interface IPaymentGet extends IPayment {
    id: number;
    payment_date: string;
    registered_by_id: number;
    cancelled_at: string | null,
    cancelled_by_id: number | null,
}

export interface IPaymentListGetResponse {
    payments: IPaymentGet[];
}
