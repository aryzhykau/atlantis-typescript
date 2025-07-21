import {
    ITrainerResponse,
    ITrainerCreatePayload,
    ITrainerUpdatePayload,
    ITrainersList,
    IStatusUpdatePayload // Используем этот общий интерфейс для обновления статуса
} from "../../features/trainers/models/trainer.ts";
import { baseApi } from "./api.ts";
import { IPaymentHistoryResponse, IPaymentHistoryFilter } from "../../features/payments/models/payment";
import { IPaymentListResponse, IPaymentFilter } from "../../features/payments/models/payment";
// Mobile trainer models
import { TrainerTraining, AttendanceUpdate, QuickPayment, TrainerStats } from "../../features/trainer-mobile/models";
import {
  Student,
  Payment,
  TrainerPaymentMobile,
} from '../../features/trainer-mobile/models';
import { Expense } from '../../features/trainer-mobile/models/expense';
import { skipToken } from '@reduxjs/toolkit/query';

export const trainersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTrainers: builder.query<ITrainersList, void>({
            query: () => '/trainers',
            providesTags: (result) =>
                result
                    ? [
                          ...result.trainers.map(({ id }) => ({ type: 'Trainer' as const, id })),
                          { type: 'Trainer', id: 'LIST' },
                      ]
                    : [{ type: 'Trainer', id: 'LIST' }],
        }),
        getTrainerById: builder.query<ITrainerResponse, number>({
            query: (trainerId) => `/trainers/${trainerId}`,
            providesTags: (_, __, trainerId) => [{ type: 'Trainer', id: trainerId }],
        }),
        createTrainer: builder.mutation<ITrainerResponse, ITrainerCreatePayload>({
            query: (trainerData) => ({
                url: '/trainers',
                method: 'POST',
                body: trainerData,
            }),
            invalidatesTags: [{ type: 'Trainer', id: 'LIST' }],
        }),
        updateTrainer: builder.mutation<ITrainerResponse, { trainerId: number; trainerData: ITrainerUpdatePayload }>({
            query: ({ trainerId, trainerData }) => ({
                url: `/trainers/${trainerId}`,
                method: 'PATCH', // Изменено с PUT на PATCH согласно openapi.json
                body: trainerData,
            }),
            invalidatesTags: (_, __, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
        }),
        deleteTrainer: builder.mutation<ITrainerResponse, { trainerId: number }>({
            query: ({ trainerId }) => ({
                url: `/trainers/${trainerId}`,
                method: 'DELETE',
            }),
            // Ответ ITrainerResponse согласно openapi.json
            invalidatesTags: (_, __, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
        }),
        updateTrainerStatus: builder.mutation<ITrainerResponse, { trainerId: number; statusData: IStatusUpdatePayload }>({
            query: ({ trainerId, statusData }) => ({
                url: `/trainers/${trainerId}/status`,
                method: 'PATCH',
                body: statusData,
            }),
            invalidatesTags: (_, __, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
        }),
        getTrainerPayments: builder.query<IPaymentHistoryResponse, { trainerId: number; filters?: IPaymentHistoryFilter & { period?: string; description_search?: string } }>({
            query: ({ trainerId, filters = {} }) => ({
                url: `/trainers/${trainerId}/payments`,
                method: 'GET',
                params: {
                    ...(filters.period && { period: filters.period }),
                    ...(filters.client_id && { client_id: filters.client_id }),
                    ...(filters.amount_min !== undefined && { amount_min: filters.amount_min }),
                    ...(filters.amount_max !== undefined && { amount_max: filters.amount_max }),
                    ...(filters.date_from && { date_from: filters.date_from }),
                    ...(filters.date_to && { date_to: filters.date_to }),
                    ...(filters.description_search && { description_search: filters.description_search }),
                    skip: filters.skip || 0,
                    limit: filters.limit || 50,
                },
            }),
            providesTags: (_, __, { trainerId }) => [
                { type: 'Payment', id: trainerId },
                { type: 'Payment', id: 'LIST' }
            ],
        }),
        getTrainerRegisteredPayments: builder.query<IPaymentListResponse, { trainerId: number; filters?: IPaymentFilter }>({
            query: ({ trainerId, filters = {} }) => ({
                url: `/trainers/${trainerId}/registered-payments`,
                method: 'GET',
                params: {
                    ...(filters.period && { period: filters.period }),
                    ...(filters.client_id && { client_id: filters.client_id }),
                    ...(filters.amount_min !== undefined && { amount_min: filters.amount_min }),
                    ...(filters.amount_max !== undefined && { amount_max: filters.amount_max }),
                    ...(filters.date_from && { date_from: filters.date_from }),
                    ...(filters.date_to && { date_to: filters.date_to }),
                    ...(filters.description_search && { description_search: filters.description_search }),
                    skip: filters.skip || 0,
                    limit: filters.limit || 50,
                },
            }),
            providesTags: (_, __, { trainerId }) => [
                { type: 'Payment', id: trainerId },
                { type: 'Payment', id: 'LIST' }
            ],
        }),

        // Mobile trainer endpoints
        // Получение тренировок тренера за день
        getTrainerTrainings: builder.query<TrainerTraining[], { date?: string }>({
            query: ({ date }) => ({
                url: '/real-trainings/',
                params: {
                    start_date: date,
                    end_date: date,
                    with_students: true,
                },
            }),
            providesTags: ['RealTrainingV2'],
        }),

        // Получение тренировок тренера за период (неделя)
        getTrainerTrainingsRange: builder.query<TrainerTraining[], { 
            start_date: string;
            end_date: string;
        }>({
            query: ({ start_date, end_date }) => ({
                url: '/real-trainings/',
                params: {
                    start_date,
                    end_date,
                    with_students: true,
                },
            }),
            providesTags: ['RealTrainingV2'],
        }),

        // Отметка посещаемости студента
        updateStudentAttendance: builder.mutation<any, {
            training_id: number;
            student_id: number;
            data: AttendanceUpdate;
        }>({
            query: ({ training_id, student_id, data }) => ({
                url: `/real-trainings/${training_id}/students/${student_id}/attendance`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['RealTrainingV2'],
        }),

        // Регистрация платежа (используем существующий payments API)
        createQuickPayment: builder.mutation<any, QuickPayment>({
            query: (payment) => ({
                url: '/payments/',
                method: 'POST',
                body: payment,
            }),
            invalidatesTags: ['Payment'],
        }),

        // Получение платежей тренера (мобильная версия)
        getTrainerPaymentsMobile: builder.query<any[], { period?: 'week' | '2weeks' }>({
            query: ({ period = 'week' }) => ({
                url: '/payments/filtered',
                params: {
                    registered_by_me: true,
                    period,
                },
            }),
            providesTags: ['Payment'],
        }),

        // Получение статистики тренера
        getTrainerStats: builder.query<TrainerStats, { period?: 'today' | 'week' | 'month' }>({
            query: ({ period = 'week' }) => ({
                url: `/trainers/me/stats?period=${period}`,
            }),
            providesTags: ['TrainerStats'],
        }),

        // Получение студентов тренера
        getTrainerStudents: builder.query<Student[], { trainer_id: number }>({
            query: ({ trainer_id }) => `trainers/${trainer_id}/students`,
            providesTags: ['Students'],
        }),

        getExpenses: builder.query<Expense[], { period: string }>({
            query: ({ period }) => `expenses/?period=${period}`,
            providesTags: (result, error, arg) => (result ? [{ type: 'Expenses', id: 'LIST' }] : []),
        }),
        createExpense: builder.mutation<Expense, Partial<Expense>>({
            query: (body) => ({
                url: 'expenses/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Expenses', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetTrainersQuery,
    useGetTrainerByIdQuery, // Переименован хук
    useCreateTrainerMutation,
    useUpdateTrainerMutation,
    useDeleteTrainerMutation,
    useUpdateTrainerStatusMutation, // Добавлен новый хук
    useGetTrainerPaymentsQuery,
    useGetTrainerRegisteredPaymentsQuery,
    // Mobile trainer hooks
    useGetTrainerTrainingsQuery,
    useGetTrainerTrainingsRangeQuery,
    useUpdateStudentAttendanceMutation,
    useCreateQuickPaymentMutation,
    useGetTrainerPaymentsMobileQuery,
    useGetTrainerStatsQuery,
    useGetTrainerStudentsQuery,
    useGetExpensesQuery,
    useCreateExpenseMutation,
} = trainersApi;