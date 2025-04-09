import * as yup from "yup";

export interface IClientFormField {
    name: string; // Название поля
    label: string; // Метка для отображения
    type?: string; // Тип поля (например, "email", "text" и др.)
    validation?: yup.AnySchema; // Валидация с использованием Yup
    group?: string; // Группа, к которой принадлежит поле
    isDatePicker?: boolean; // Опциональное свойство для полей с датами
}