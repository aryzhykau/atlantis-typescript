import { User } from "../../../models/user";

export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    client?: User;
} 