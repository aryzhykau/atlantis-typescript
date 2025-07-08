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
            providesTags: (result, error, trainerId) => [{ type: 'Trainer', id: trainerId }],
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
            invalidatesTags: (result, error, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
        }),
        deleteTrainer: builder.mutation<ITrainerResponse, { trainerId: number }>({
            query: ({ trainerId }) => ({
                url: `/trainers/${trainerId}`,
                method: 'DELETE',
            }),
            // Ответ ITrainerResponse согласно openapi.json
            invalidatesTags: (result, error, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
        }),
        updateTrainerStatus: builder.mutation<ITrainerResponse, { trainerId: number; statusData: IStatusUpdatePayload }>({
            query: ({ trainerId, statusData }) => ({
                url: `/trainers/${trainerId}/status`,
                method: 'PATCH',
                body: statusData,
            }),
            invalidatesTags: (result, error, { trainerId }) => [{ type: 'Trainer', id: trainerId }, { type: 'Trainer', id: 'LIST' }],
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
            providesTags: (result, error, { trainerId }) => [
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
            providesTags: (result, error, { trainerId }) => [
                { type: 'Payment', id: trainerId },
                { type: 'Payment', id: 'LIST' }
            ],
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
} = trainersApi;