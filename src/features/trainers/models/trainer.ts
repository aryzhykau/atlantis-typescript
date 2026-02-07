// import dayjs from "dayjs"; // dayjs не используется в новых интерфейсах напрямую, даты будут строками или Dayjs на уровне форм

// Enum для ролей пользователя, соответствует UserRole из openapi.json
export enum UserRole {
    CLIENT = "CLIENT",
    TRAINER = "TRAINER",
    ADMIN = "ADMIN",
    OWNER = "OWNER",
}

// Базовые данные тренера, общие для создания и ответа
export interface ITrainerCoreData {
    first_name: string;
    last_name: string;
    date_of_birth: string; // Формат 'YYYY-MM-DD' как в API
    email: string;
    phone: string;
}

// Интерфейс для ответа API при запросе данных тренера (GET /trainers/{trainer_id} или из списка)
// Соответствует схеме TrainerResponse из openapi.json
export interface ITrainerResponse {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone_country_code: string;
    phone_number: string;
    role: UserRole;
    is_authenticated_with_google: boolean;
    salary: number | null; // Null if not set OR if user has no permission (only OWNER sees this)
    is_fixed_salary: boolean | null; // Null if not set OR if user has no permission (only OWNER sees this)
    is_active: boolean | null;
    deactivation_date: string | null; // Формат 'YYYY-MM-DDTHH:mm:ss.sssZ' или аналогичный ISO date-time
}

// Интерфейс для payload при СОЗДАНИИ тренера (POST /trainers/)
// Соответствует схеме TrainerCreate из openapi.json
export interface ITrainerCreatePayload {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
    phone_country_code: string;
    phone_number: string;
    salary?: number | null; // Опционально, т.к. в схеме есть default для is_fixed_salary, а salary может быть null
    is_fixed_salary?: boolean; // Опционально, default: false в API
}

// Интерфейс для payload при ОБНОВЛЕНИИ тренера (PATCH /trainers/{trainer_id})
// Соответствует схеме TrainerUpdate из openapi.json
// Все поля опциональны
export interface ITrainerUpdatePayload {
    first_name?: string | null;
    last_name?: string | null;
    date_of_birth?: string | null; // Формат 'YYYY-MM-DD'
    email?: string | null;
    phone_country_code?: string;
    phone_number?: string;
    salary?: number | null;
    is_fixed_salary?: boolean | null;
    is_active?: boolean | null;
}

// Интерфейс для ответа API при запросе списка тренеров (GET /trainers/)
// Соответствует схеме TrainersList из openapi.json
export interface ITrainersList {
    trainers: ITrainerResponse[];
    // В openapi.json для TrainersList нет поля total, в отличие от InvoiceList или SubscriptionList.
    // Если API его не возвращает, то и здесь его быть не должно.
    // Если бы было, добавили бы: total: number;
}

// Интерфейс для payload при ОБНОВЛЕНИИ СТАТУСА (PATCH /trainers/{trainer_id}/status)
// Соответствует схеме StatusUpdate из openapi.json
export interface IStatusUpdatePayload {
    is_active: boolean;
}

// Интерфейс для ответа API при запросе зарплат тренера по типам тренировок
// Соответствует схеме TrainerTrainingTypeSalaryResponse из backend
export interface ITrainerTrainingTypeSalary {
    id: number;
    trainer_id: number;
    training_type_id: number;
    salary: number;
}


