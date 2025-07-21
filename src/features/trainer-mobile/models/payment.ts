export interface Payment {
    id: number;
    client_id: number;
    amount: number;
    payment_date: string;
    description: string;
    registered_by_id: number;
    client_first_name?: string;
    client_last_name?: string;
    registered_by_first_name?: string;
    registered_by_last_name?: string;
}

export interface TrainerPaymentMobile extends Payment {} 