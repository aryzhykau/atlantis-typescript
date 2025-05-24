/**
 * Базовая информация о студенте (для встроенного отображения).
 * Уточнить на основе полной схемы Student из openapi.json, если необходимо больше полей.
 */
export interface StudentBasicInfo {
  id: number;
  name: string; // Предположительно ФИО или Имя + Фамилия
  // Можно добавить другие поля, если они нужны (например, фото, статус)
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