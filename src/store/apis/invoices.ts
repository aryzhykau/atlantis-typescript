import {IInvoiceGetResponse} from "../../features/invoices/models/invoice.ts";
import {baseApi} from "./api.ts";
import dayjs from "dayjs";

export const invoicesApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getInvoices: builder.query<IInvoiceGetResponse, {client_id?: number, status?: string}>({
            query: ({client_id, status}: { client_id?: number | null, status?: string | null }) => ({
                params: {
                    ...(client_id && { client_id }),
                    ...(status && { status })
                },

                url: '/invoices',
                method: 'GET',
            }),
            transformResponse: (response: IInvoiceGetResponse) => {
                return {
                    ...response,
                    items: response.items.map((invoice) => ({
                        ...invoice,
                        created_at: dayjs(invoice.created_at).tz(dayjs.tz.guess()).format()
                    }))
                };
            },
        }),

        getClientInvoices: builder.query<IInvoiceGetResponse, {client_id: number, status: string | null}>({
            query: ({client_id, status}) => ({
                params: status ?{
                    status: status
                } : {},
                url: `/invoices/client/${client_id}`,
                method: 'GET',
            })
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

export const { useGetInvoicesQuery, useGetClientInvoicesQuery } = invoicesApi;