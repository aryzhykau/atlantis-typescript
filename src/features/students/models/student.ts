

// Соответствует схеме StudentUser из openapi.json (информация о клиенте-родителе)
export interface IStudentParentClientData {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  balance: number;
}

// Базовые поля студента, общие для разных интерфейсов
export interface IStudentBase {
  first_name: string;
  last_name: string;
  date_of_birth: string; // Формат 'YYYY-MM-DD'
}

// Соответствует схеме StudentResponse из openapi.json
export interface IStudent extends IStudentBase {
  id: number;
  is_active: boolean;
  client: IStudentParentClientData; // Вложенная информация о клиенте-родителе
  active_subscription_id: number | null;
  deactivation_date: string | null; // Формат 'YYYY-MM-DDTHH:mm:ss.sssZ'
}

// Для создания нового студента, соответствует StudentCreate
export interface IStudentCreatePayload extends IStudentBase {
  client_id: number;
  is_active?: boolean; // По умолчанию true на бэкенде
}

// Для создания студента как часть создания клиента, соответствует StudentCreateWithoutClient
// (если is_student = true в ClientCreate, то используется этот интерфейс для students)
export interface IStudentCreateNestedPayload extends IStudentBase {}


// Для обновления информации о студенте, соответствует StudentUpdate
export interface IStudentUpdatePayload {
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null; // Формат 'YYYY-MM-DD'
  is_active?: boolean | null;
  client_id?: number | null; // Позволяет сменить родителя
}

// Для обновления статуса студента, соответствует StatusUpdate
export interface IStudentStatusUpdatePayload {
  is_active: boolean;
}

// Для ответа при обновлении статуса студента, соответствует StudentStatusResponse
export interface IStudentStatusResponse {
  id: number;
  is_active: boolean;
  deactivation_date: string | null; // Формат 'YYYY-MM-DDTHH:mm:ss.sssZ'
  client_status: boolean; // Статус родительского клиента
}

// Используется в ClientResponse, когда нужно кратко представить студента
// (Например, если бы ClientResponse содержал список своих студентов)
// На данный момент openapi.json не показывает такого прямого использования,
// но оставим для возможной будущей консистентности, если API изменится.
// Поля client и active_subscription_id здесь не нужны, т.к. они есть в полной IStudent.
export interface IStudentAsNested extends IStudentBase {
    id: number;
    is_active: boolean;
    deactivation_date: string | null;
}

// Удалены старые интерфейсы IStudentGet, IStudentActiveSubscription и IStudentSubscriptionFormValues
// так как они не соответствуют текущей схеме API и заменены новыми.