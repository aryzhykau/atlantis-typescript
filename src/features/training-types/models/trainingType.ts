export interface ITrainingType {
    id: number;
    name: string;
    is_subscription_only: boolean;
    price: number | null;
    color: string; // HEX format, e.g., #RRGGBB
    is_active: boolean;
    max_participants: number | null;
    // Cancellation policy
    cancellation_mode?: 'FIXED' | 'FLEXIBLE';
    safe_cancel_time_morning?: string | null; // 'HH:MM:SS' or null
    safe_cancel_time_evening?: string | null;
    safe_cancel_time_morning_prev_day?: boolean | null;
    safe_cancel_time_evening_prev_day?: boolean | null;
    safe_cancel_hours?: number | null;
}

export interface ITrainingTypeCreate {
    name: string;
    is_subscription_only: boolean;
    price?: number | null; // Optional in create if backend defaults or handles null
    color: string; // HEX format
    is_active?: boolean; // Optional, defaults to true on backend
    max_participants?: number | null;
    // Cancellation policy (optional during create)
    cancellation_mode?: 'FIXED' | 'FLEXIBLE';
    safe_cancel_time_morning?: string | null;
    safe_cancel_time_evening?: string | null;
    safe_cancel_time_morning_prev_day?: boolean | null;
    safe_cancel_time_evening_prev_day?: boolean | null;
    safe_cancel_hours?: number | null;
}

export interface ITrainingTypeUpdate {
    name?: string;
    is_subscription_only?: boolean;
    price?: number | null;
    color?: string; // HEX format
    is_active?: boolean;
    max_participants?: number | null;
    cancellation_mode?: 'FIXED' | 'FLEXIBLE';
    safe_cancel_time_morning?: string | null;
    safe_cancel_time_evening?: string | null;
    safe_cancel_time_morning_prev_day?: boolean | null;
    safe_cancel_time_evening_prev_day?: boolean | null;
    safe_cancel_hours?: number | null;
}

// It might also be useful to have a list response type if the API wraps it
export interface ITrainingTypesList {
    training_types: ITrainingType[];
    // total?: number; // if pagination/total count is part of the response
} 