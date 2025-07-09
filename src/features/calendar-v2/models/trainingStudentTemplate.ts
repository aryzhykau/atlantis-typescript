/**
 * Базовая информация о студенте (для встроенного отображения).
 * Уточнить на основе полной схемы Student из openapi.json, если необходимо больше полей.
 */

// Добавляем базовый интерфейс для клиента (родителя)
export interface ClientBasicInfo {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string; // Email тоже может быть полезен
  // Можно добавить id клиента, если потребуется
}

export interface StudentBasicInfo {
  id: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // YYYY-MM-DD
  is_active?: boolean;
  client?: ClientBasicInfo; // Добавляем опциональное поле клиента
  // active_subscription_id?: number; // Эти поля могут быть излишни для базовой информации в календаре
  // deactivation_date?: string | null;
}

/**
 * Ответ API для привязки студента к шаблону тренировки.
 * На основе схемы TrainingStudentTemplateResponse из openapi.json.
 */
export interface TrainingStudentTemplate {
  id: number;
  training_template_id: number;
  student_id: number;
  student: StudentBasicInfo;
  start_date: string; // YYYY-MM-DD
  is_frozen: boolean;
}

/**
 * Данные для создания новой привязки студента к шаблону.
 * На основе схемы TrainingStudentTemplateCreate из openapi.json.
 */
export interface TrainingStudentTemplateCreate {
  training_template_id: number;
  student_id: number;
  start_date: string; // YYYY-MM-DD
  is_frozen?: boolean; // По умолчанию false
}

/**
 * Данные для обновления существующей привязки студента к шаблону.
 * Предполагаемая структура на основе TrainingStudentTemplateCreate, все поля опциональны.
 */
export interface TrainingStudentTemplateUpdate {
  training_template_id?: number;
  student_id?: number;
  start_date?: string; // YYYY-MM-DD
  is_frozen?: boolean;
} 