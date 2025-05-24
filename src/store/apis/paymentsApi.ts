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

    }),
});

export const { useCreatePaymentMutation, useGetClientPaymentsQuery, useUpdatePaymentMutation, useCancelPaymentMutation } = PaymentsApi;