import {IPayment, IPaymentGet } from "../../features/payments/models/payment.ts";
import {baseApi} from "./api.ts";

export const PaymentsApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getClientPayments: builder.query<IPaymentGet[], {clientId: number; status: string;}>({
            query: ({clientId, status}) => ({
                url: `/payments/client/${clientId}`,
                method: 'GET',
                params: {
                    skip: 0,
                    limit: 10000,
                    cancelled_status: status,
                },
            }),
        }),
        createPayment: builder.mutation<IPaymentGet, {paymentData: IPayment;}>({
            query: ({paymentData}) =>  ({
                url: '/payments/',
                method: 'POST',
                body: paymentData,
            })
        }),

        updatePayment: builder.mutation<IPaymentGet, { paymentId: number; paymentData: IPayment;}>({
            query: ({paymentId, paymentData}) => ({
                url: `/payments/${paymentId}`,
                method: 'PATCH',
                body: paymentData,
            }),
        }),
        cancelPayment: builder.mutation<void, { paymentId: number;}>({
            query: ({paymentId}) => ({
                url: `/payments/${paymentId}`,
                method: 'DELETE',
            }),
        }),
        getPaymentHistory: builder.query<import("../../features/payments/models/payment").IPaymentHistoryResponse, import("../../features/payments/models/payment").IPaymentHistoryFilter>({
            query: (filters) => ({
                url: '/payments/history',
                method: 'GET',
                params: {
                    ...(filters.operation_type && { operation_type: filters.operation_type }),
                    ...(filters.client_id && { client_id: filters.client_id }),
                    ...(filters.created_by_id && { created_by_id: filters.created_by_id }),
                    ...(filters.date_from && { date_from: filters.date_from }),
                    ...(filters.date_to && { date_to: filters.date_to }),
                    ...(filters.amount_min !== undefined && { amount_min: filters.amount_min }),
                    ...(filters.amount_max !== undefined && { amount_max: filters.amount_max }),
                    skip: filters.skip || 0,
                    limit: filters.limit || 50,
                },
            }),
        }),
    }),
});

export const { useCreatePaymentMutation, useGetClientPaymentsQuery, useUpdatePaymentMutation, useCancelPaymentMutation, useGetPaymentHistoryQuery } = PaymentsApi;