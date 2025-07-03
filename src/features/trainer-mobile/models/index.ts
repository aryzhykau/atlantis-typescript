// Модели для тренерского мобильного интерфейса

export interface TrainerTraining {
  id: number;
  training_date: string;
  start_time: string;
  training_type?: {
    id: number;
    name: string;
    color: string;
  };
  students: TrainerTrainingStudent[];
  status?: string;
}

export interface TrainerTrainingStudent {
  id: number;
  student_id: number;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    client?: {
      id: number;
      first_name: string;
      last_name: string;
      phone?: string;
    };
  };
  status: 'REGISTERED' | 'PRESENT' | 'ABSENT' | 'CANCELLED_SAFE' | 'CANCELLED_PENALTY' | 'WAITLIST';
  attendance_marked_at?: string;
}

export interface AttendanceUpdate {
  status: 'PRESENT' | 'ABSENT';
  cancellation_reason?: string;
}

export interface QuickPayment {
  student_id: number;
  amount: number;
  payment_method: 'CASH' | 'CARD' | 'TRANSFER';
  description?: string;
  training_id?: number;
}

export interface TrainerStats {
  today_trainings: number;
  week_trainings: number;
  total_students: number;
  attendance_rate: number;
} 