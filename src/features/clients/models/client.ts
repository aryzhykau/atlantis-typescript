import {Dayjs} from "dayjs";
import { IStudent } from "../../students/models/student";

// Базовые поля для клиента
interface IClientCoreData {
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string | null;
}

// Интерфейс для данных клиента, полученных от API (GET)
export interface IClientUserGet extends IClientCoreData {
    id: number;
    balance: number | null;
    created_at: string;
    active_subscription: string;
    students?: IStudent[];
    is_active: boolean | null;
    deactivation_date?: string | null;
    is_authenticated_with_google: boolean;
    phone_country_code: string;
    phone_number: string;
    whatsapp_country_code?: string | null;
    whatsapp_number?: string | null;
}

// Интерфейс для формы добавления студента к клиенту, специфичный для ClientPage
export interface StudentFormValuesClientPage {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
    client_id: number;
}

// Интерфейс для payload при СОЗДАНИИ студента из ClientPage
export interface IStudentCreateFromClientPagePayload {
    first_name: string;
    last_name: string;
    date_of_birth: string; // YYYY-MM-DD
    client_id: number;
}


// Интерфейс для значений формы создания/редактирования клиента
export interface IClientUserFormValues {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: Dayjs | string | null; // Для UI FormikDatePicker может использовать Dayjs, при отправке конвертируется в строку
    whatsapp_number: string; // Используется в форме, может быть пустой строкой, если не указан
    is_student: boolean; // Поле для формы СОЗДАНИЯ, указывает, является ли сам клиент студентом
    students: IStudentFormShape[];  // Используем IStudentFormShape[]
}

// Интерфейс для payload при СОЗДАНИИ клиента (соответствует ClientCreate из openapi.json)
export interface IClientCreatePayload {
    first_name: string;
    last_name: string;
    date_of_birth: string; // Формат 'YYYY-MM-DD'
    is_student?: boolean; // По умолчанию false в openapi
    email: string;
    phone_country_code: string;
    phone_number: string;
    whatsapp_country_code?: string | null;
    whatsapp_number?: string | null; // Должен соответствовать паттерну API, если не null
    students?: Array<{ first_name: string; last_name: string; date_of_birth: string; }>;
}

// Утилитарный тип для формы создания студента в рамках формы клиента
export interface IStudentFormShape {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | string | null;
}


// Интерфейс для payload при ОБНОВЛЕНИИ клиента (PATCH /clients/{client_id})
export interface ClientUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_country_code?: string;
    phone_number?: string;
    date_of_birth?: string | null; // Формат 'YYYY-MM-DD'
    whatsapp_country_code?: string | null;
    whatsapp_number?: string | null; // Должен соответствовать паттерну API, если не null
    is_active?: boolean;
}

export interface IClientSubscriptionFormValues  {
    subscription_id: number;
}

export interface IClientSubscriptionCreate {
    subscription_id: number;
}