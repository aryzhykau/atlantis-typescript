import { baseApi } from './api';
import {
  TrainingTemplate,
  TrainingTemplateCreate,
  TrainingTemplateUpdate,
} from '../../features/calendar-v2/models/trainingTemplate';

// Импорты для будущих эндпоинтов (раскомментировать по мере необходимости)
import {
  TrainingStudentTemplate,
  TrainingStudentTemplateCreate,
  TrainingStudentTemplateUpdate,
} from '../../features/calendar-v2/models/trainingStudentTemplate';
import {
  RealTraining,
  RealTrainingCreate,
  RealTrainingUpdate,
  GetRealTrainingsParams,
  AddStudentToRealTrainingPayload,
  UpdateStudentAttendancePayload,
  RealTrainingStudent,
} from '../../features/calendar-v2/models/realTraining';

// Определяем типы тегов как строки, соответствующие тем, что в baseApi.tagTypes
const TRAINING_TEMPLATE_TAG: 'TrainingTemplateV2' = 'TrainingTemplateV2';
const TRAINING_STUDENT_TEMPLATE_TAG: 'TrainingStudentTemplateV2' = 'TrainingStudentTemplateV2';
const REAL_TRAINING_TAG: 'RealTrainingV2' = 'RealTrainingV2';

export const calendarApiV2 = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // --- Training Templates Endpoints ---
    getTrainingTemplates: builder.query<TrainingTemplate[], void>({
      query: () => 'training_templates/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: TRAINING_TEMPLATE_TAG, id } as const)),
              { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
            ]
          : [{ type: TRAINING_TEMPLATE_TAG, id: 'LIST' }],
    }),
    getTrainingTemplateById: builder.query<TrainingTemplate, number>({
      query: (id) => `training_templates/${id}`,
      providesTags: (result, error, id) => [{ type: TRAINING_TEMPLATE_TAG, id }],
    }),
    createTrainingTemplate: builder.mutation<TrainingTemplate, TrainingTemplateCreate>({
      query: (newTemplate) => ({
        url: 'training_templates/',
        method: 'POST',
        body: newTemplate,
      }),
      invalidatesTags: [{ type: TRAINING_TEMPLATE_TAG, id: 'LIST' }],
    }),
    updateTrainingTemplate: builder.mutation<TrainingTemplate, { id: number; data: TrainingTemplateUpdate }>({
      query: ({ id, data }) => ({
        url: `training_templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TRAINING_TEMPLATE_TAG, id }],
    }),
    deleteTrainingTemplate: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `training_templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: TRAINING_TEMPLATE_TAG, id },
        { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
      ],
    }),

    // --- Training Student Templates Endpoints ---
    getTrainingStudentTemplates: builder.query<TrainingStudentTemplate[], { trainingTemplateId?: number } | void>({
      query: (arg) => {
        // Проверяем, передан ли аргумент и содержит ли он trainingTemplateId
        if (arg && typeof arg === 'object' && 'trainingTemplateId' in arg && arg.trainingTemplateId !== undefined) {
          return `training_student_templates/?training_template_id=${arg.trainingTemplateId}`;
        }
        return 'training_student_templates/'; // Если аргумента нет, или он пустой, запрашиваем все
      },
      providesTags: (result, error, arg) => // `arg` здесь это исходный аргумент запроса
        result
          ? [
              ...result.map(({ id }) => ({ type: TRAINING_STUDENT_TEMPLATE_TAG, id } as const)),
              { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' },
              // Если был запрос с trainingTemplateId, можно добавить тег для этого конкретного списка
              arg && typeof arg === 'object' && 'trainingTemplateId' in arg && arg.trainingTemplateId !== undefined 
                ? { type: TRAINING_STUDENT_TEMPLATE_TAG, id: `LIST_FOR_TEMPLATE_${arg.trainingTemplateId}` }
                : { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'GENERAL_LIST' } // или просто LIST, как было
            ]
          : [{ type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' }],
    }),
    getTrainingStudentTemplateById: builder.query<TrainingStudentTemplate, number>({
      query: (id) => `training_student_templates/${id}`,
      providesTags: (result, error, id) => [{ type: TRAINING_STUDENT_TEMPLATE_TAG, id }],
    }),
    createTrainingStudentTemplate: builder.mutation<TrainingStudentTemplate, TrainingStudentTemplateCreate>({
      query: (newStudentTemplate) => ({
        url: 'training_student_templates/',
        method: 'POST',
        body: newStudentTemplate,
      }),
      invalidatesTags: [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' },
        // Также нужно инвалидировать связанный TrainingTemplate, чтобы обновить его assigned_students
        // Это потребует знания ID связанного шаблона. Можно сделать более сложную логику инвалидации
        // или пересмотреть структуру данных/запросов, если это критично.
        // Пока оставляем так для простоты.
      ],
    }),
    updateTrainingStudentTemplate: builder.mutation<TrainingStudentTemplate, { id: number; data: TrainingStudentTemplateUpdate }>({
      query: ({ id, data }) => ({
        url: `training_student_templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id },
        // Потенциально инвалидировать и связанный TrainingTemplate
      ],
    }),
    deleteTrainingStudentTemplate: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `training_student_templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id },
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' },
        // Потенциально инвалидировать и связанный TrainingTemplate
      ],
    }),

    // --- Real Trainings Endpoints ---
    getRealTrainings: builder.query<RealTraining[], GetRealTrainingsParams | void>({
      query: (params) => {
        if (params) {
          // Формируем строку параметров запроса из объекта params
          const queryParams = new URLSearchParams();
          if (params.startDate) queryParams.append('start_date', params.startDate);
          if (params.endDate) queryParams.append('end_date', params.endDate);
          if (params.trainerId) queryParams.append('trainer_id', params.trainerId.toString());
          if (params.trainingTypeId) queryParams.append('training_type_id', params.trainingTypeId.toString());
          if (params.studentId) queryParams.append('student_id', params.studentId.toString());
          return `real-trainings/?${queryParams.toString()}`;
        }
        return 'real-trainings/';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: REAL_TRAINING_TAG, id } as const)),
              { type: REAL_TRAINING_TAG, id: 'LIST' },
            ]
          : [{ type: REAL_TRAINING_TAG, id: 'LIST' }],
    }),
    getRealTrainingById: builder.query<RealTraining, number>({
      query: (id) => `real-trainings/${id}`,
      providesTags: (result, error, id) => [{ type: REAL_TRAINING_TAG, id }],
    }),
    createRealTraining: builder.mutation<RealTraining, RealTrainingCreate>({
      query: (newTraining) => ({
        url: 'real-trainings/',
        method: 'POST',
        body: newTraining,
      }),
      invalidatesTags: [{ type: REAL_TRAINING_TAG, id: 'LIST' }],
    }),
    updateRealTraining: builder.mutation<RealTraining, { id: number; data: RealTrainingUpdate }>({
      query: ({ id, data }) => ({
        url: `real-trainings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: REAL_TRAINING_TAG, id }],
    }),
    deleteRealTraining: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `real-trainings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: REAL_TRAINING_TAG, id },
        { type: REAL_TRAINING_TAG, id: 'LIST' },
      ],
    }),

    // Эндпоинт для генерации тренировок на следующую неделю
    generateNextWeekTrainings: builder.mutation<{ message: string; created_trainings_count: number }, void>({
      query: () => ({
        url: 'real-trainings/generate-next-week',
        method: 'POST',
      }),
      invalidatesTags: [{ type: REAL_TRAINING_TAG, id: 'LIST' }],
    }),

    // Эндпоинты для управления студентами на реальной тренировке
    addStudentToRealTraining: builder.mutation<RealTraining, { trainingId: number; payload: AddStudentToRealTrainingPayload }>({
      query: ({ trainingId, payload }) => ({
        url: `real-trainings/${trainingId}/students`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
    }),
    removeStudentFromRealTraining: builder.mutation<{ success: boolean }, { trainingId: number; studentId: number; removeFuture?: boolean }>({
      query: ({ trainingId, studentId, removeFuture }) => ({
        url: `real-trainings/${trainingId}/students/${studentId}`,
        method: 'DELETE',
        params: removeFuture ? { remove_future: true } : {},
      }),
      invalidatesTags: (result, error, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
    }),
    updateStudentAttendance: builder.mutation<RealTrainingStudent, { trainingId: number; studentId: number; payload: UpdateStudentAttendancePayload }>({
      query: ({ trainingId, studentId, payload }) => ({
        url: `real-trainings/${trainingId}/students/${studentId}/attendance`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, error, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
    }),
    cancelStudentFromTraining: builder.mutation<{ success: boolean }, { trainingId: number; studentId: number }>({
      query: ({ trainingId, studentId }) => ({
        url: `real-trainings/${trainingId}/students/${studentId}/cancel`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
    }),

    // Эндпоинт для полной отмены реальной тренировки администратором
    cancelRealTraining: builder.mutation<RealTraining, { trainingId: number; cancellationReason?: string }>({
      query: ({ trainingId, cancellationReason }) => ({
        url: `real-trainings/${trainingId}/cancel`,
        method: 'POST',
        // API ожидает тело запроса для отмены, даже если оно пустое для POST
        body: cancellationReason ? { cancellation_reason: cancellationReason } : {},
      }),
      invalidatesTags: (result, error, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
    }),

    // TODO: Добавить остальные эндпоинты для Real Trainings:
    // - generateNextWeek
    // - addStudentToRealTraining
    // - removeStudentFromRealTraining
    // - updateStudentAttendance
    // - cancelStudentFromTraining
    // - cancelRealTraining
  }),
  overrideExisting: false, // Важно, если baseApi уже используется где-то еще
});

export const {
  useGetTrainingTemplatesQuery,
  useGetTrainingTemplateByIdQuery,
  useCreateTrainingTemplateMutation,
  useUpdateTrainingTemplateMutation,
  useDeleteTrainingTemplateMutation,
  useGetTrainingStudentTemplatesQuery,
  useGetTrainingStudentTemplateByIdQuery,
  useCreateTrainingStudentTemplateMutation,
  useUpdateTrainingStudentTemplateMutation,
  useDeleteTrainingStudentTemplateMutation,
  useGetRealTrainingsQuery,
  useGetRealTrainingByIdQuery,
  useCreateRealTrainingMutation,
  useUpdateRealTrainingMutation,
  useDeleteRealTrainingMutation,
  useGenerateNextWeekTrainingsMutation,
  useAddStudentToRealTrainingMutation,
  useRemoveStudentFromRealTrainingMutation,
  useUpdateStudentAttendanceMutation,
  useCancelStudentFromTrainingMutation,
  useCancelRealTrainingMutation,
  // TODO: Экспортировать хуки для других эндпоинтов
} = calendarApiV2;

// Экспорт хуков для использования в компонентах
// export const {
//   useGetScheduleTemplateQuery,
//   useGetActualTrainingsQuery,
//   // ...другие хуки
// } = calendarApiV2;

// Теги для инвалидации кеша (если еще не определены в api.ts)
// Рекомендуется определять теги в основном файле api.ts, если они используются несколькими API слайсами.
// Если они специфичны только для calendarApiV2, можно оставить здесь или вынести в отдельный файл.
// Примеры:
// export const SCHEDULE_TEMPLATE_V2_TAG = 'ScheduleTemplateV2';
// export const ACTUAL_TRAININGS_V2_TAG = 'ActualTrainingsV2'; 