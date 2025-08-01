// Модели для тренерского мобильного интерфейса

export interface TrainerStudent {
  student_id: number;
  status: 'PRESENT' | 'ABSENT' | 'REGISTERED' | 'CANCELLED_SAFE' | 'CANCELLED_PENALTY';
  student: {
      first_name: string;
      last_name: string;
  };
}

export interface TrainerTraining {
  id: number;
  training_date: string;
  start_time: string;
  training_type: {
      name: string;
      color: string;
  };
  students: TrainerStudent[];
}

export interface AttendanceUpdate {
status: 'PRESENT' | 'ABSENT';
cancellation_reason?: string;
}

export interface QuickPayment {
client_id: number;
amount: number;
description?: string;
}

export interface TrainerStats {
today_trainings: number;
week_trainings: number;
total_students: number;
attendance_rate: number;
} 

export interface Expense {
  id: number;
  name: string;
  user_id: number;
  expense_type_id: number;
  amount: number;
  expense_date: string;
  description?: string;
} 