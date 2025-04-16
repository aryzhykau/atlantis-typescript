import dayjs, {Dayjs} from "dayjs";
import {ISubscriptionGet} from "../../subscriptions/models/subscription.ts";

export interface IClientUser {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date?: Dayjs | string | null | undefined;
    whatsapp: string | null;
    is_client: boolean;
    clients: IClient[];
}

export interface IClient {
    first_name: string;
    last_name: string;
    birth_date?: Dayjs | string | null | undefined;
}

export interface IClientGet extends IClient {
    is_active: boolean;
    has_trial: boolean;
}

export interface IClientUserGet extends IClientUser {
    id: number;
    active_subscription: IClientActiveSubscription | null;
    has_trial: boolean;
    balance: number;
    created_at: string;
    google_authenticated: boolean;
    is_birthday?: boolean;
    role: string;
}

export interface IClientUserFormValues {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date?: dayjs.Dayjs | string | null;
    parent_name: string;
    whatsapp: string;
    is_client: boolean;
    clients: IClient[];
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
    sessions_left: number;
}