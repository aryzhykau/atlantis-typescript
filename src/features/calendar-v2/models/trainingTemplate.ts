import { TrainingStudentTemplate } from './trainingStudentTemplate'; // Будет создано далее

/**
 * Базовая информация о типе тренировки (для встроенного отображения).
 * Уточнить на основе полной схемы TrainingType из openapi.json, если необходимо больше полей.
 */
export interface TrainingTypeBasicInfo {
  id: number;
  name: string;
  color?: string; // Предполагаем, что цвет также важен для календаря
}

/**
 * Базовая информация о тренере (для встроенного отображения).
 * Уточнить на основе полной схемы Trainer из openapi.json, если необходимо больше полей.
 */
export interface TrainerBasicInfo {
  id: number;
  first_name?: string;
  last_name?: string;
  // Можно добавить другие поля, если они нужны для отображения в карточке
}

/**
 * Ответ API для шаблона тренировки.
 * На основе схемы TrainingTemplateResponse из openapi.json.
 */
export interface TrainingTemplate {
  id: number;
  day_number: number; // 1-7 (1 - Пн)
  start_time: string; // "HH:MM:SS"
  training_type_id: number;
  training_type: TrainingTypeBasicInfo;
  responsible_trainer_id: number;
  trainer: TrainerBasicInfo;
  assigned_students: TrainingStudentTemplate[]; // Детали студентов, привязанных к шаблону
}

/**
 * Данные для создания нового шаблона тренировки.
 * На основе схемы TrainingTemplateCreate из openapi.json.
 */
export interface TrainingTemplateCreate {
  day_number: number; // 1-7
  start_time: string; // "HH:MM:SS"
  training_type_id: number;
  responsible_trainer_id: number;
  assigned_student_ids?: number[]; // Массив ID студентов
}

/**
 * Данные для обновления существующего шаблона тренировки.
 * На основе схемы TrainingTemplateUpdate из openapi.json.
 * Все поля опциональны.
 */
export interface TrainingTemplateUpdate {
  day_number?: number; // 1-7
  start_time?: string; // "HH:MM:SS"
  training_type_id?: number;
  responsible_trainer_id?: number;
  assigned_student_ids?: number[]; // Массив ID студентов
} 