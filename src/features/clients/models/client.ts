import dayjs, {Dayjs} from "dayjs";
import {ISubscriptionGet} from "../../subscriptions/models/subscription.ts";

export interface IClient {
    first_name: string;
    last_name: string;
    active?: boolean;
    email: string;
    phone: string;
    is_birthday?: boolean;
    birth_date?: Dayjs | string| null | undefined;
    parent_name: string | null;
    whatsapp: string | null;
    role: string;
}
export interface IClientGet extends IClient {
    id: number;
    active_subscription: IClientActiveSubscription | null;
    invoices: any;
    created_at: string;
    google_authenticated: boolean;
}

export interface IClientFormValues {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date?: dayjs.Dayjs | string | null;
    parent_name: string;
    whatsapp: string;
}


export interface IClientSubscriptionFormValues  {
    subscription_id: number;
}

export interface IClientSubscriptionCreate {
    subscription_id: number;
}

export interface IClientActiveSubscription {
    id: number;
    subscription_id: number;
    subscription: ISubscriptionGet;
    start_date: Dayjs | string | null | undefined;
    end_date: Dayjs |  string | null | undefined;
}