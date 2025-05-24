import {IInvoiceGet, IInvoiceGetResponse} from "../../features/invoices/models/invoice.ts";
import {baseApi} from "./api.ts";
import {BaseQueryMeta, BaseQueryResult} from "@reduxjs/toolkit/query";
import dayjs from "dayjs";

export const invoicesApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getInvoices: builder.query<IInvoiceGet[], {user_id?: number, only_unpaid: boolean}>({
            query: ({user_id, only_unpaid}: { user_id?: number | null, only_unpaid: boolean }) => ({
                params: {
                    user_id: user_id,
                    only_unpaid: only_unpaid.toString()
                },

                url: '/invoices',
                method: 'GET',
            }),
            transformResponse: (response: IInvoiceGet[]) => {
                return response.map((invoice) => {
                    return {
                        ...invoice,
                        created_at: dayjs(invoice.created_at).tz(dayjs.tz.guess()).format()
                    };
                })
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