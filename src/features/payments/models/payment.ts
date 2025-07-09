
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

export interface IPaymentHistoryFilter {
    skip?: number;
    limit?: number;
    client_id?: number;
    created_by_id?: number;
    operation_type?: string;
    amount_min?: number;
    amount_max?: number;
    date_from?: string;
    date_to?: string;
}

export interface IPaymentHistoryItem {
    id: number;
    client_id: number;
    payment_id: number | null;
    invoice_id: number | null;
    operation_type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string | null;
    created_at: string;
    created_by_id: number;
    client_first_name: string;
    client_last_name: string;
    created_by_first_name: string;
    created_by_last_name: string;
    payment_description: string | null;
}

export interface IPaymentHistoryResponse {
    items: IPaymentHistoryItem[];
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
}

export interface IPaymentFilter {
    skip?: number;
    limit?: number;
    client_id?: number;
    amount_min?: number;
    amount_max?: number;
    date_from?: string;
    date_to?: string;
    description_search?: string;
    period?: string;
}

export interface IPaymentListResponse {
    payments: IPaymentGet[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}
