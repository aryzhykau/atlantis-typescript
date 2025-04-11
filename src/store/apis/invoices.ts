import {IInvoiceGet} from "../../features/invoices/models/invoice.ts";
import {baseApi} from "./api.ts";

export const invoicesApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getInvoices: builder.query<IInvoiceGet[], {user_id?: number, only_unpaid: boolean}>({
            query: ({user_id, only_unpaid}:{user_id?: number | null, only_unpaid: boolean}) => ({
                params: {
                    user_id: user_id,
                    only_unpaid: only_unpaid.toString()
                },

                url: '/invoices',
                method: 'GET',
            }),
        }),
        // createInvoice: builder.mutation<IInvoiceGet, {subscriptionData: IInvoice;}>({
        //     query: ({subscriptionData}) =>  ({
        //         url: '/invoices',
        //         method: 'POST',
        //         body: subscriptionData,
        //     })
        // }),

        // updateInvoice: builder.mutation<IInvoiceGet, { subscriptionId: number; subscriptionData: IInvoice;}>({
        //     query: ({subscriptionId, subscriptionData}) => ({
        //         url: `/invoices/${subscriptionId}`,
        //         method: 'PUT',
        //         body: subscriptionData,
        //     }),
        // }),

        // deleteInvoice: builder.mutation<void, { subscriptionId: number;}>({
        //     query: ({subscriptionId}) => ({
        //         url: `/invoices/${subscriptionId}`,
        //         method: 'DELETE',
        //     }),
        // }),

    }),
});

export const { useGetInvoicesQuery } = invoicesApi;