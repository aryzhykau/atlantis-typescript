
export interface ITrainer {
    first_name: string;
    last_name: string;
    active?: boolean;
    email: string;
    phone: string;
    salary: number | null;
    fixed_salary: boolean;
    role?: string | null;
}
export interface ITrainerGet extends ITrainer {
    id: number;
    created_at: string;
    google_authenticated: boolean;
}


