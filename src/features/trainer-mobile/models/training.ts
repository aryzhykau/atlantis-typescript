import { Student } from "./student";

export interface TrainerStudent {
    student_id: number;
    status: 'PRESENT' | 'ABSENT' | 'REGISTERED' | 'CANCELLED_SAFE' | 'CANCELLED_PENALTY';
    student: Student;
}

export interface Training {
    id: number;
    training_date: string;
    start_time: string;
    training_type: {
        name: string;
        color: string;
    };
    students: TrainerStudent[];
} 