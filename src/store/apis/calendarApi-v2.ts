import { baseApi } from './api';
import { debugLog } from '../../features/calendar-v2/utils/debug';
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
import { ITemplateAddStudentResponse } from '../../features/subscriptions/models/subscription_v2';
import {
  RealTraining,
  RealTrainingCreate,
  RealTrainingUpdate,
  GetRealTrainingsParams,
  RealTrainingStudent,
  StudentCancellationRequest,
  StudentCancellationResponse,
  TrainingCancellationRequest,
} from '../../features/calendar-v2/models/realTraining';

// Определяем типы тегов как строки, соответствующие тем, что в baseApi.tagTypes
const TRAINING_TEMPLATE_TAG: 'TrainingTemplateV2' = 'TrainingTemplateV2';
const TRAINING_STUDENT_TEMPLATE_TAG: 'TrainingStudentTemplateV2' = 'TrainingStudentTemplateV2';
const REAL_TRAINING_TAG: 'RealTrainingV2' = 'RealTrainingV2';

export const calendarApiV2 = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // --- Training Templates Endpoints ---
    getTrainingTemplates: builder.query<TrainingTemplate[], { dayNumber?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.dayNumber !== undefined) {
          searchParams.append('day_number', params.dayNumber.toString());
        }
        return `training_templates/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
      providesTags: (result, __, params) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: TRAINING_TEMPLATE_TAG, id } as const)),
              { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
              // Добавляем тег для фильтрованного списка
              params?.dayNumber !== undefined 
                ? { type: TRAINING_TEMPLATE_TAG, id: `LIST_DAY_${params.dayNumber}` }
                : { type: TRAINING_TEMPLATE_TAG, id: 'LIST_ALL' },
            ]
          : [{ type: TRAINING_TEMPLATE_TAG, id: 'LIST' }],
    }),
    getTrainingTemplateById: builder.query<TrainingTemplate, number>({
      query: (id) => `training_templates/${id}`,
      providesTags: (_, __, id) => [{ type: TRAINING_TEMPLATE_TAG, id }],
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
      invalidatesTags: (_, __, { id }) => [{ type: TRAINING_TEMPLATE_TAG, id }],
    }),
    // Специализированная мутация для перемещения тренировки
    moveTrainingTemplate: builder.mutation<TrainingTemplate, { 
      id: number; 
      dayNumber: number; 
      startTime: string; 
    }>({
      query: ({ id, dayNumber, startTime }) => ({
        url: `training_templates/${id}`,
        method: 'PUT',
        body: {
          day_number: dayNumber,
          start_time: startTime,
        },
      }),
      // Ensure lists are refreshed after a successful move
      invalidatesTags: (_, __, { id }) => [
        { type: TRAINING_TEMPLATE_TAG, id },
        { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
      ],
      // Оптимистичные обновления с поиском всех кешей
      onQueryStarted: async ({ id, dayNumber, startTime }, { dispatch, queryFulfilled, getState }) => {
        debugLog('🎯 Начинаем оптимистичное обновление шаблона:', { id, dayNumber, startTime });
        
        const patches: any[] = [];
        
        // Получаем все активные кеши для getTrainingTemplates
        const state = getState() as any;
        const apiState = state.api;
        
        debugLog('🔍 Ищем кеши getTrainingTemplates...');
        Object.keys(apiState.queries).forEach(queryKey => {
          if (queryKey.startsWith('getTrainingTemplates')) {
            debugLog('🎯 Найден кеш getTrainingTemplates:', queryKey);
          }
        });
        
        // Обновляем все найденные кеши getTrainingTemplates
        Object.keys(apiState.queries).forEach(queryKey => {
          if (queryKey.startsWith('getTrainingTemplates')) {
            try {
              // Пытаемся понять параметры из ключа кеша
              let queryArgs = undefined;
              if (queryKey.includes('dayNumber')) {
                // Это запрос с фильтром по дню
                const match = queryKey.match(/"dayNumber":(\d+)/);
                if (match) {
                  queryArgs = { dayNumber: parseInt(match[1]) };
                }
              }
              
              const patchResult = dispatch(
                calendarApiV2.util.updateQueryData('getTrainingTemplates', queryArgs, (draft) => {
                  debugLog(`📝 Обновляем кеш с параметрами: ${JSON.stringify(queryArgs)}, найдено элементов: ${draft.length}`);
                  const template = draft.find(t => t.id === id);
                  if (template) {
                    debugLog('✅ Нашли шаблон в кеше, обновляем:', template);
                    template.day_number = dayNumber;
                    template.start_time = startTime;
                    debugLog('✨ Обновленный шаблон:', template);
                  } else {
                    debugLog('❌ Шаблон не найден в кеше!');
                  }
                })
              );
              patches.push(patchResult);
            } catch (e) {
              debugLog('⚠️ Ошибка при обновлении кеша getTrainingTemplates:', e);
            }
          }
        });

        try {
          debugLog('⏳ Ждем ответ API...');
          await queryFulfilled;
          debugLog('✅ API ответил успешно');
        } catch (error) {
          debugLog('❌ Ошибка API, откатываем изменения:', error);
          // В случае ошибки откатываем все изменения
          patches.forEach(patch => patch.undo());
        }
      },
      // НЕТ invalidatesTags! Только оптимистичные обновления
    }),
    deleteTrainingTemplate: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `training_templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
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
      providesTags: (result, __, arg) => // `arg` здесь это исходный аргумент запроса
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
      providesTags: (_, __, id) => [{ type: TRAINING_STUDENT_TEMPLATE_TAG, id }],
    }),
    createTrainingStudentTemplate: builder.mutation<ITemplateAddStudentResponse, TrainingStudentTemplateCreate>({
      query: (newStudentTemplate) => ({
        url: 'training_student_templates/',
        method: 'POST',
        body: newStudentTemplate,
      }),
      invalidatesTags: (result) => [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' },
        result ? { type: TRAINING_TEMPLATE_TAG, id: result.training_template_id } : { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
        // If subscription was activated, refresh student data (subscription status changed)
        ...(result?.subscription_activated ? [{ type: 'Students' as const, id: result.student_id }] : []),
      ],
    }),
    updateTrainingStudentTemplate: builder.mutation<TrainingStudentTemplate, { id: number; data: TrainingStudentTemplateUpdate }>({
      query: ({ id, data }) => ({
        url: `training_student_templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id: arg.id },
        // Invalidate parent training template if server returned its id
        result ? { type: TRAINING_TEMPLATE_TAG, id: (result as any).training_template_id } : { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
      ],
    }),
    deleteTrainingStudentTemplate: builder.mutation<TrainingStudentTemplate, number>({
      query: (id) => ({
        url: `training_student_templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, _error, id) => [
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id },
        { type: TRAINING_STUDENT_TEMPLATE_TAG, id: 'LIST' },
        // Invalidate parent template cache if server returned the deleted record with training_template_id
        result ? { type: TRAINING_TEMPLATE_TAG, id: (result as any).training_template_id } : { type: TRAINING_TEMPLATE_TAG, id: 'LIST' },
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
      if (params.withStudents) queryParams.append('with_students', 'true');
      // includeCancelled is a client-side camelCase prop; backend expects include_cancelled
      if ((params as any).includeCancelled) queryParams.append('include_cancelled', 'true');
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
      providesTags: (_, __, id) => [{ type: REAL_TRAINING_TAG, id }],
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
      invalidatesTags: (_, __, { id }) => [{ type: REAL_TRAINING_TAG, id }],
    }),
    // Специализированная мутация для перемещения реальной тренировки
    moveRealTraining: builder.mutation<RealTraining, { 
      id: number; 
      trainingDate: string; 
      startTime: string; 
    }>({
      query: ({ id, trainingDate, startTime }) => ({
        url: `real-trainings/${id}`,
        method: 'PUT',
        body: {
          training_date: trainingDate,
          start_time: startTime,
        },
      }),
      // Оптимистичные обновления с учетом параметров даты
      // Ensure lists are refreshed after a successful move
      invalidatesTags: (_, __, { id }) => [
        { type: REAL_TRAINING_TAG, id },
        { type: REAL_TRAINING_TAG, id: 'LIST' },
      ],
      onQueryStarted: async ({ id, trainingDate, startTime }, { dispatch, queryFulfilled, getState }) => {
        debugLog('🎯 Начинаем оптимистичное обновление тренировки:', { id, trainingDate, startTime });
        
        const patches: any[] = [];
        
        // Получаем все активные кеши для getRealTrainings
        const state = getState() as any;
        const apiState = state.api;
        
        // Обновляем все найденные кеши getRealTrainings
        Object.keys(apiState.queries).forEach(queryKey => {
          if (queryKey.startsWith('getRealTrainings')) {
            debugLog('🔍 Найден кеш:', queryKey);
            
            try {
              // Пытаемся понять параметры из ключа кеша
              let queryArgs = undefined;
              if (queryKey.includes('startDate')) {
                // Это запрос с параметрами даты
                const match = queryKey.match(/"startDate":"([^"]+)","endDate":"([^"]+)"/);
                if (match) {
                  queryArgs = {
                    startDate: match[1],
                    endDate: match[2]
                  };
                }
              }
              
              const patchResult = dispatch(
                calendarApiV2.util.updateQueryData('getRealTrainings', queryArgs, (draft) => {
                  debugLog(`📝 Обновляем кеш с параметрами: ${JSON.stringify(queryArgs)}, найдено элементов: ${draft.length}`);
                  const training = draft.find(t => t.id === id);
                  if (training) {
                    debugLog('✅ Нашли тренировку в кеше, обновляем:', training);
                    training.training_date = trainingDate;
                    training.start_time = startTime;
                    debugLog('✨ Обновленная тренировка:', training);
                  } else {
                    debugLog('❌ Тренировка не найдена в кеше!');
                  }
                })
              );
              patches.push(patchResult);
            } catch (e) {
              debugLog('⚠️ Ошибка при обновлении кеша:', e);
            }
          }
        });

        try {
          debugLog('⏳ Ждем ответ API...');
          await queryFulfilled;
          debugLog('✅ API ответил успешно');
        } catch (error) {
          debugLog('❌ Ошибка API, откатываем изменения:', error);
          // В случае ошибки откатываем все изменения
          patches.forEach(patch => patch.undo());
        }
      },
      // НЕТ invalidatesTags! Только оптимистичные обновления
    }),
    deleteRealTraining: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `real-trainings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
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
    addStudentToRealTraining: builder.mutation<RealTrainingStudent, { training_id: number; student_id: number; is_trial: boolean }>({
      query: ({ training_id, student_id, is_trial }) => ({
        url: `real-trainings/${training_id}/students`,
        method: 'POST',
        body: { student_id, is_trial },
      }),
      invalidatesTags: (_, __, { training_id }) => [{ type: REAL_TRAINING_TAG, id: training_id }],
    }),
    updateStudentAttendance: builder.mutation<RealTrainingStudent, { training_id: number; student_id: number; status_of_presence: string }>({
      query: ({ training_id, student_id, status_of_presence }) => ({
        url: `real-trainings/${training_id}/students/${student_id}/attendance`,
        method: 'PUT',
        // Backend expects { status: 'ABSENT' } according to RealTrainingStudentUpdate schema
        body: { status: status_of_presence },
      }),
      invalidatesTags: (_, __, { training_id }) => [{ type: REAL_TRAINING_TAG, id: training_id }],
    }),
    removeStudentFromRealTraining: builder.mutation<{ success: boolean }, { training_id: number; student_id: number }>({
      query: ({ training_id, student_id }) => ({
        url: `real-trainings/${training_id}/students/${student_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { training_id }) => [{ type: REAL_TRAINING_TAG, id: training_id }],
    }),
    cancelStudentFromTraining: builder.mutation<StudentCancellationResponse, { training_id: number; student_id: number; data: StudentCancellationRequest }>({
      query: ({ training_id, student_id, data }) => ({
        url: `real-trainings/${training_id}/students/${student_id}/cancel`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: (_, __, { training_id }) => [{ type: REAL_TRAINING_TAG, id: training_id }],
    }),

    // Эндпоинт для полной отмены реальной тренировки администратором
    cancelRealTraining: builder.mutation<RealTraining, { trainingId: number; cancellationData: TrainingCancellationRequest }>({
      query: ({ trainingId, cancellationData }) => ({
        url: `real-trainings/${trainingId}/cancel`,
        method: 'POST',
        body: cancellationData,
      }),
      invalidatesTags: (_, __, { trainingId }) => [{ type: REAL_TRAINING_TAG, id: trainingId }],
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
  useMoveTrainingTemplateMutation,
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
  useMoveRealTrainingMutation,
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