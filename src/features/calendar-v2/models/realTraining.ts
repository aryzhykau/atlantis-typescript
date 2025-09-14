import { TrainerBasicInfo, TrainingTypeBasicInfo } from './trainingTemplate';
import { StudentBasicInfo } from './trainingStudentTemplate';

/**
 * Статус посещения студентом реальной тренировки.
 * Обновлено согласно новой системе статусов с отменами
 */
export type TrainingAttendanceStatus = 
  | 'REGISTERED'        // Зарегистрирован
  | 'CANCELLED_SAFE'    // Отменен безопасно (>12ч, без штрафа)
  | 'CANCELLED_PENALTY' // Отменен поздно (<12ч, со штрафом)
  | 'PRESENT'           // Присутствовал
  | 'ABSENT'            // Отсутствовал
  | 'WAITLIST'          // В листе ожидания
  // Старые статусы для обратной совместимости
  | 'PLANNED' | 'ABSENT_RESPECTFUL' | 'ABSENT_LATE_CANCEL';

/**
 * Статус реальной тренировки.
 * (Уточнить возможные значения из openapi.json или по логике бэкенда)
 */
export type RealTrainingStatus = 'planned' | 'completed' | 'cancelled_by_coach' | 'cancelled_by_admin' | 'issue'; // 'issue' - если что-то пошло не так

/**
 * Информация о студенте, записанном на реальную тренировку.
 * На основе RealTrainingStudentResponse (предполагаемая структура из анализа).
 */
export interface RealTrainingStudent {
  id: number; // ID записи студента на тренировку (не ID самого студента)
  student_id: number;
  student: StudentBasicInfo;
  status: TrainingAttendanceStatus; // Изменено с status_of_presence на status согласно бэкенду
  cancellation_reason?: string;
  notification_time?: string;
  cancelled_at?: string;
  attendance_marked_at?: string;
  requires_payment: boolean;
  // template_student_id?: number; // Если нужно связывать с записью в шаблоне
}

/**
 * Ответ API для реальной тренировки.
 * На основе схемы RealTrainingResponse из openapi.json.
 */
export interface RealTraining {
  id: number;
  training_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  training_type_id: number;
  training_type: TrainingTypeBasicInfo;
  responsible_trainer_id: number;
  trainer: TrainerBasicInfo;
  template_id?: number; // ID шаблона, если создана на его основе
  status: RealTrainingStatus;
  cancellation_reason?: string;
  students: RealTrainingStudent[];
}

/**
 * Данные для создания новой реальной тренировки.
 * На основе схемы RealTrainingCreate из openapi.json.
 */
export interface RealTrainingCreate {
  training_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  responsible_trainer_id: number;
  training_type_id: number;
  template_id?: number;
  student_ids?: number[]; // Массив ID студентов для немедленного добавления
}

/**
 * Данные для обновления существующей реальной тренировки.
 * На основе схемы RealTrainingUpdate из openapi.json.
 */
export interface RealTrainingUpdate {
  training_date?: string; // YYYY-MM-DD
  start_time?: string; // HH:MM:SS
  responsible_trainer_id?: number;
  training_type_id?: number;
  status?: RealTrainingStatus;
  cancellation_reason?: string;
  // Обновление списка студентов обычно идет через отдельные эндпоинты
}

/**
 * Параметры для запроса списка реальных тренировок (фильтрация).
 * На основе GET /real-trainings/
 */
export interface GetRealTrainingsParams {
  startDate?: string;     // YYYY-MM-DD
  endDate?: string;       // YYYY-MM-DD
  trainerId?: number;
  trainingTypeId?: number;
  studentId?: number;
  withStudents?: boolean; // Include student data
  // Можно добавить другие параметры, если API их поддерживает (например, status)
}

/**
 * Данные для добавления студента на реальную тренировку.
 * На основе POST /real-trainings/{training_id}/students
 */
export interface AddStudentToRealTrainingPayload {
  student_id: number;
  // template_student_id?: number; // Если нужно связать с шаблоном
}

/**
 * Данные для отмены записи студента.
 */
export interface StudentCancellationRequest {
  reason: string;
  notification_time: string; // ISO 8601 format
}

/**
 * Ответ при отмене участия студента с информацией о зарплате тренера.
 */
export interface StudentCancellationResponse {
  student_cancelled: boolean;
  trainer_salary_result: {
    training_id: number;
    trainer_id: number;
    cancelled_student_id: number;
    cancellation_time: string;
    training_datetime: string;
    salary_decision: {
      should_receive_salary: boolean;
      reason: string;
      remaining_students_count: number;
      hours_before_training: number;
    };
    expense_created: boolean;
    expense_id?: number;
    salary_amount?: number;
  };
}

/**
 * Запрос на отмену всей тренировки администратором.
 */
export interface TrainingCancellationRequest {
  reason: string;
  process_refunds?: boolean; // По умолчанию true
}

/**
 * Сводка по зарплате тренера за период.
 */
export interface TrainerSalarySummary {
  trainer_id: number;
  trainer_name: string;
  period: {
    start: string;
    end: string;
  };
  is_fixed_salary: boolean;
  fixed_salary_amount?: number;
  individual_training_payments: {
    total_amount: number;
    payment_count: number;
    payments: any[]; // Define expense type based on your needs
  };
}

/**
 * Предварительный расчет зарплаты тренера при отмене.
 */
export interface SalaryCalculationPreview {
  training_id: number;
  trainer_id: number;
  cancelled_student_id: number;
  cancellation_time: string;
  training_datetime: string;
  salary_decision: {
    should_receive_salary: boolean;
    reason: string;
    remaining_students_count: number;
    hours_before_training: number;
  };
  potential_salary_amount: number;
  would_create_expense: boolean;
}

/**
 * Данные для обновления статуса посещения студента.
 * На основе PUT /real-trainings/{training_id}/students/{student_id}/attendance
 */
export interface UpdateStudentAttendancePayload {
  status_of_presence: TrainingAttendanceStatus;
  cancellation_reason?: string; // Если отмена
} 