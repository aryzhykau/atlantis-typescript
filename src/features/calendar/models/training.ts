export interface ITraining {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  trainer_id: number;
  training_type_id: number;
  max_participants?: number;
  students?: ITrainingStudent[];
  training_datetime?: string; // Для обратной совместимости
}

export interface ITrainingGet extends ITraining {
  created_at: string;
  updated_at: string;
}

export interface ITrainingStudent {
  id: number;
  student_id: number;
  training_id: number;
  attendance_status: string;
  student?: {
    id: number;
    name: string;
    email: string;
    birth_date?: string; // Добавляем поле для обратной совместимости
  };
} 