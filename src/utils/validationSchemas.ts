import * as Yup from 'yup';

// Common validation rules
export const commonValidations = {
  // Text validations
  name: Yup.string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов')
    .required('Название обязательно'),

  shortName: Yup.string()
    .min(1, 'Минимум 1 символ')
    .max(50, 'Максимум 50 символов')
    .required('Обязательно'),

  description: Yup.string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),

  // Number validations
  price: Yup.number()
    .min(0, 'Цена не может быть отрицательной')
    .required('Цена обязательна'),

  positiveInteger: Yup.number()
    .integer('Должно быть целое число')
    .min(1, 'Должно быть больше 0')
    .required('Обязательно'),

  nonNegativeInteger: Yup.number()
    .integer('Должно быть целое число')
    .min(0, 'Не может быть отрицательным')
    .required('Обязательно'),

  validityDays: Yup.number()
    .integer('Должно быть целое число')
    .min(1, 'Срок действия должен быть минимум 1 день')
    .max(3650, 'Максимальный срок действия 10 лет') // 10 years
    .required('Срок действия обязателен'),

  numberOfSessions: Yup.number()
    .integer('Должно быть целое число')
    .min(0, 'Количество занятий не может быть отрицательным')
    .max(1000, 'Максимальное количество занятий 1000')
    .required('Количество занятий обязательно'),

  // Boolean validations
  isActive: Yup.boolean().required(),
  isAutoRenew: Yup.boolean(),

  // Selection validations
  requiredSelect: Yup.string().required('Необходимо выбрать опцию'),
  optionalSelect: Yup.string().optional(),

  // Phone validation
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Неверный формат телефона')
    .optional(),

  // Email validation
  email: Yup.string()
    .email('Неверный формат email')
    .optional(),

  // ID validations
  id: Yup.number()
    .positive('ID должно быть положительным числом')
    .integer('ID должно быть целым числом')
    .required('ID обязательно'),

  optionalId: Yup.number()
    .positive('ID должно быть положительным числом')
    .integer('ID должно быть целым числом')
    .optional()
    .nullable(),
};

// Subscription form schemas
export const subscriptionSchemas = {
  create: Yup.object({
    name: commonValidations.name,
    price: commonValidations.price,
    validity_days: commonValidations.validityDays,
    number_of_sessions: commonValidations.numberOfSessions,
    is_active: commonValidations.isActive,
  }),

  update: Yup.object({
    name: commonValidations.name,
    price: commonValidations.price,
    validity_days: commonValidations.validityDays,
    number_of_sessions: commonValidations.numberOfSessions,
    is_active: commonValidations.isActive,
  }),

  addToStudent: Yup.object({
    subscription_id: Yup.number().required("Выберите абонемент")
  }),
};

// Student form schemas
export const studentSchemas = {
  create: Yup.object({
    first_name: commonValidations.shortName,
    last_name: commonValidations.shortName,
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    email: commonValidations.email,
    phone: commonValidations.phone,
  }),
  
  freezeSubscription: Yup.object({
    freeze_start_date: Yup.date()
      .required('Дата начала заморозки обязательна')
      .min(new Date(), 'Дата начала не может быть в прошлом'),
    freeze_duration_days: Yup.number()
      .required('Количество дней обязательно')
      .min(1, 'Минимальное количество дней: 1')
      .integer('Количество дней должно быть целым числом'),
  }),
};

// Trainer form schemas
export const trainerSchemas = {
  create: Yup.object({
    first_name: commonValidations.shortName,
    last_name: commonValidations.shortName,
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    email: Yup.string()
      .email('Неверный формат email')
      .required('Email обязателен для заполнения'),
    phone: Yup.string().required('Телефон обязателен для заполнения'),
    salary: Yup.number()
      .nullable()
      .min(0, 'Зарплата не может быть отрицательной')
      .optional(),
    is_fixed_salary: Yup.boolean().required(),
  }),
  
  update: Yup.object({
    first_name: commonValidations.shortName,
    last_name: commonValidations.shortName,
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    email: Yup.string()
      .email('Неверный формат email')
      .required('Email обязателен для заполнения'),
    phone: Yup.string().required('Телефон обязателен для заполнения'),
    salary: Yup.number()
      .nullable()
      .min(0, 'Зарплата не может быть отрицательной')
      .optional(),
    is_fixed_salary: Yup.boolean().required(),
  }),
};

// Training form schemas
export const trainingSchemas = {
  create: Yup.object({
    name: commonValidations.name,
    description: commonValidations.description,
    trainer_id: commonValidations.id,
    student_id: commonValidations.id,
  }),
};

// Training Type form schemas
export const trainingTypeSchemas = {
  create: Yup.object({
    name: Yup.string()
      .min(2, 'Название должно содержать минимум 2 символа')
      .max(50, 'Название не должно превышать 50 символов')
      .required('Название обязательно'),
    price: Yup.number()
      .nullable()
      .min(0, 'Цена не может быть отрицательной')
      .when('is_subscription_only', {
        is: true,
        then: (schema) => schema.oneOf([null], 'Для тренировки по подписке цена должна быть пустой'),
      }),
    max_participants: Yup.number()
      .nullable()
      .min(1, 'Максимальное количество учеников не может быть меньше 1'),
    is_subscription_only: Yup.boolean().required(),
    color: Yup.string()
      .matches(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)')
      .required('Цвет обязателен'),
    is_active: Yup.boolean().required(),
  }),
  
  update: Yup.object({
    name: Yup.string()
      .min(2, 'Название должно содержать минимум 2 символа')
      .max(50, 'Название не должно превышать 50 символов')
      .required('Название обязательно'),
    price: Yup.number()
      .nullable()
      .min(0, 'Цена не может быть отрицательной')
      .when('is_subscription_only', {
        is: true,
        then: (schema) => schema.oneOf([null], 'Для тренировки по подписке цена должна быть пустой'),
      }),
    max_participants: Yup.number()
      .nullable()
      .min(1, 'Максимальное количество учеников не может быть меньше 1'),
    is_subscription_only: Yup.boolean().required(),
    color: Yup.string()
      .matches(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)')
      .required('Цвет обязателен'),
    is_active: Yup.boolean().required(),
  }),
};

// Utility function to create conditional schema
export const createConditionalSchema = (
  baseSchema: Yup.ObjectSchema<any>, 
  condition: boolean, 
  additionalFields: Record<string, Yup.AnySchema>
) => {
  if (condition) {
    return baseSchema.shape(additionalFields);
  }
  return baseSchema;
};



// Client form schemas
export const clientSchemas = {
  create: Yup.object({
    first_name: commonValidations.shortName,
    last_name: commonValidations.shortName,
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    email: commonValidations.email,
    phone: commonValidations.phone,
    gender: Yup.string()
      .oneOf(['M', 'F'], 'Выберите пол')
      .required('Пол обязателен для заполнения'),
    students: Yup.array().of(
      Yup.object({
        first_name: commonValidations.shortName,
        last_name: commonValidations.shortName,
        date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
        gender: Yup.string()
          .oneOf(['M', 'F'], 'Выберите пол')
          .required('Пол обязателен для заполнения'),
      })
    ),
  }),
  
  update: Yup.object({
    first_name: commonValidations.shortName,
    last_name: commonValidations.shortName,
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    email: commonValidations.email,
    phone: commonValidations.phone,
    gender: Yup.string()
      .oneOf(['M', 'F'], 'Выберите пол')
      .required('Пол обязателен для заполнения'),
    students: Yup.array().of(
      Yup.object({
        first_name: commonValidations.shortName,
        last_name: commonValidations.shortName,
        date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
        gender: Yup.string()
          .oneOf(['M', 'F'], 'Выберите пол')
          .required('Пол обязателен для заполнения'),
      })
    ),
  }),
};

// Utility function to make fields optional
export const makeFieldsOptional = (
  schema: Yup.ObjectSchema<any>, 
  fields: string[]
) => {
  const shape = schema.fields;
  const newShape: Record<string, any> = {};
  
  Object.keys(shape).forEach(key => {
    const field = shape[key] as Yup.AnySchema;
    if (fields.includes(key)) {
      newShape[key] = field.optional();
    } else {
      newShape[key] = field;
    }
  });
  
  return Yup.object(newShape);
};
