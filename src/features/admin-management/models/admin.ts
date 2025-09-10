import { UserRole } from '../../trainers/models/trainer';

// Admin management interfaces following the same patterns as trainer models
export interface IAdminResponse {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone_country_code: string;
    phone_number: string;
    role: UserRole.ADMIN;
    is_authenticated_with_google: boolean;
    is_active: boolean;
    deactivation_date: string | null;
}

export interface IAdminCreatePayload {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone_country_code: string;
    phone_number: string;
}

export interface IAdminUpdatePayload {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    email?: string;
    phone_country_code?: string;
    phone_number?: string;
}

export interface IAdminStatusUpdatePayload {
    is_active: boolean;
}

export interface IAdminsList {
    admins: IAdminResponse[];
}

// Dashboard stats interfaces
export interface IAdminDashboardStats {
    total_clients: number;
    total_students: number;
    trainings_in_month: number;
    trainings_in_year: number;
    labels: string[];
    trainings_series: number[];
}

export interface IOwnerDashboardStats extends IAdminDashboardStats {
    revenue_series: number[];
    expense_series: number[];
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    avg_revenue_per_client: number;
}
