// Типы для системы абонементов v2

import { IStudentSubscriptionResponse } from './subscription';

// Полный ответ абонемента v2 (все поля v1 + v2-специфичные)
export interface IStudentSubscriptionV2Response extends IStudentSubscriptionResponse {
    sessions_per_week: number | null;
    payment_due_date: string | null;   // Формат YYYY-MM-DD
    is_prorated: boolean;
}

// Payload для создания абонемента v2 (start_date вычисляется сервером)
export interface IStudentSubscriptionCreateV2Payload {
    student_id: number;
    subscription_id: number;
    is_auto_renew?: boolean;
}

// Список v2 абонементов студента
export interface IStudentSubscriptionV2List {
    items: IStudentSubscriptionV2Response[];
    total: number;
}

// Пропущенное занятие
export interface IMissedSession {
    id: number;
    student_id: number;
    student_subscription_id: number;
    real_training_student_id: number;
    is_excused: boolean;
    excused_by_id: number | null;
    excused_at: string | null;
    makeup_deadline_date: string | null;   // YYYY-MM-DD
    made_up_at: string | null;
    made_up_real_training_student_id: number | null;
    created_at: string;
    // Вложенные данные (если API возвращает)
    training_date?: string;
    training_type_name?: string;
}

export interface IMissedSessionList {
    items: IMissedSession[];
    total: number;
}

// Системная настройка
export interface ISystemSetting {
    key: string;
    value: string;
    updated_by_id: number | null;
    updated_at: string | null;
}

export interface ISystemSettingUpdate {
    key: string;
    value: string;
}
