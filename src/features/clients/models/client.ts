import {Dayjs} from "dayjs";
// import {IStudent} from "../../students/models/student.ts"; // Заменяем на IStudentFormShape
import { IStudentFormShape } from '../components/ClientsForm'; // Импортируем новый тип

// Интерфейс, отражающий основные поля данных клиента, возвращаемые API
export interface IClientCoreData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string | null; // API возвращает 'YYYY-MM-DD' или null
    whatsapp_number: string | null; // Изменено с whatsapp, соответствует openapi ClientResponse
}

// Интерфейс для ответа API при запросе данных клиента (GET /clients/{client_id})
// Должен строго соответствовать схеме ClientResponse из openapi.json
export interface IClientUserGet extends IClientCoreData {
    id: number;
    role: string; // Соответствует UserRole enum из API (CLIENT, TRAINER, ADMIN)
    is_authenticated_with_google: boolean; // Изменено с google_authenticated
    balance: number | null; // Соответствует openapi (number | null)
    is_active: boolean | null; // Соответствует openapi (boolean | null)
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
    phone: string; // Должен соответствовать паттерну API '^\+?[0-9]{10,15}$'
    whatsapp_number?: string | null; // Должен соответствовать паттерну API, если не null
    students?: Array<{ first_name: string; last_name: string; date_of_birth: string; }>;
}

// Интерфейс для payload при ОБНОВЛЕНИИ клиента (соответствует ClientUpdate из openapi.json)
export interface ClientUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string; // Должен соответствовать паттерну API
    whatsapp_number?: string | null; // Должен соответствовать паттерну API, если не null
    date_of_birth?: string | null; // Формат 'YYYY-MM-DD'
    is_active?: boolean | null; // Добавлено | null
    balance?: number | null;    // Добавлено | null
}

export interface IClientSubscriptionFormValues  {
    subscription_id: number;
}

export interface IClientSubscriptionCreate {
    subscription_id: number;
}