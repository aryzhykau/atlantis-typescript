// Базовые поля для абонемента
export interface ISubscriptionBase {
    name: string;
    price: number;
    number_of_sessions: number;
    validity_days: number;
    is_active?: boolean; // На бэке default: true для SubscriptionCreate
}

// Соответствует SubscriptionResponse из openapi.json
export interface ISubscriptionResponse extends ISubscriptionBase {
    id: number;
}

// Для создания нового абонемента, соответствует SubscriptionCreate
export interface ISubscriptionCreatePayload extends ISubscriptionBase {}

// Для обновления существующего абонемента, соответствует SubscriptionUpdate
// Все поля опциональны
export interface ISubscriptionUpdatePayload {
    name?: string | null;
    price?: number | null;
    number_of_sessions?: number | null;
    validity_days?: number | null;
    is_active?: boolean | null;
}

// Для ответа от эндпоинта /subscriptions (список абонементов)
export interface ISubscriptionListResponse {
    items: ISubscriptionResponse[];
    total: number;
}

// Для создания привязки абонемента к студенту, соответствует StudentSubscriptionCreate
export interface IStudentSubscriptionCreatePayload {
    student_id: number;
    subscription_id: number;
    is_auto_renew?: boolean; // На бэке default: false
}

// Соответствует StudentSubscriptionResponse из openapi.json
export interface IStudentSubscriptionResponse {
    student_id: number;
    subscription_id: number;
    is_auto_renew: boolean; // В ответе это поле обязательное
    id: number; // ID самой привязки "студент-абонемент"
    start_date: string; // Формат date-time от API
    end_date: string;   // Формат date-time от API
    freeze_start_date: string | null;
    freeze_end_date: string | null;
    sessions_left: number;
    transferred_sessions: number;
    auto_renewal_invoice_id: number | null;
    status: string; // Например, ACTIVE, EXPIRED, FROZEN, PENDING_PAYMENT
}

// Для запроса на заморозку абонемента студента
// Параметры будут передаваться в query, но интерфейс для удобства
export interface IStudentSubscriptionFreezePayload {
    freeze_start_date: string; // Формат YYYY-MM-DD или ISO date-time, бэкенд ожидает date-time
    freeze_duration_days: number;
}

// Для обновления автопродления абонемента студента (соответствует StudentSubscriptionUpdate из API)
export interface IStudentSubscriptionAutoRenewalUpdatePayload {
    is_auto_renew: boolean;
}

// Вспомогательный интерфейс для отображения данных в UI
export interface IStudentSubscriptionView extends IStudentSubscriptionResponse {
    subscription_name: string; // Название абонемента из ISubscriptionResponse
    student_name: string;    // Имя студента (first_name + last_name)
}