export interface ITrainingType {
    id: number;
    name: string;
    is_subscription_only: boolean;
    price: number | null;
    color: string; // HEX format, e.g., #RRGGBB
    is_active: boolean;
}

export interface ITrainingTypeCreate {
    name: string;
    is_subscription_only: boolean;
    price?: number | null; // Optional in create if backend defaults or handles null
    color: string; // HEX format
    is_active?: boolean; // Optional, defaults to true on backend
}

export interface ITrainingTypeUpdate {
    name?: string;
    is_subscription_only?: boolean;
    price?: number | null;
    color?: string; // HEX format
    is_active?: boolean;
}

// It might also be useful to have a list response type if the API wraps it
export interface ITrainingTypesList {
    training_types: ITrainingType[];
    // total?: number; // if pagination/total count is part of the response
} 