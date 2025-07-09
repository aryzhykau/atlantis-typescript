import { IClientCreatePayload, IClientUserGet, ClientUpdate} from "../../features/clients/models/client.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {baseApi} from "./api.ts";
import { IStudent } from "../../features/students/models/student.ts";

dayjs.extend(utc);
dayjs.extend(timezone);


export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getClients: builder.query<IClientUserGet[], void>({
            query: () => ({
                url: '/clients',
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Client' as const, id })),
                        { type: 'Client', id: 'LIST' }
                    ]
                    : [{ type: 'Client', id: 'LIST' }],
        }),
        getClient: builder.query<IClientUserGet, number>({
            query: (clientId) => ({
                url: `/clients/${clientId}`,
                method: 'GET',
            }),
            providesTags: (_, __, id) => [{ type: 'Client', id }],
        }),
        getClientStudents: builder.query<IStudent[], number>({
            query: (clientId) => ({
                url: `/clients/${clientId}/students`,
                method: 'GET',
            }),
            providesTags: (result, __, clientId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Students' as const, id: id.toString() + '_client_' + clientId.toString() })),
                        { type: 'Students', id: 'LIST_FOR_CLIENT_' + clientId },
                        { type: 'Client', id: clientId }
                    ]
                    : [{ type: 'Students', id: 'LIST_FOR_CLIENT_' + clientId }, { type: 'Client', id: clientId }],
        }),
        createClient: builder.mutation<IClientUserGet, IClientCreatePayload>({
            query: (clientData) => ({
                url: '/clients',
                method: 'POST',
                body: clientData,
            }),
            invalidatesTags: [{ type: 'Client', id: 'LIST' }],
        }),
        updateClient: builder.mutation<IClientUserGet, { clientId: number; clientData: ClientUpdate}>({
            query: ({clientId, clientData}) => {
                const dataToSend: ClientUpdate = {
                    ...clientData,
                    date_of_birth: clientData.date_of_birth ? dayjs(clientData.date_of_birth).format('YYYY-MM-DD') : null,
                };
                return {
                    url: `/clients/${clientId}`,
                    method: 'PATCH',
                    body: dataToSend,
                };
            },
            invalidatesTags: (_, __, { clientId }) => [{ type: 'Client', id: clientId }, {type: 'Client', id: 'LIST'}],
        }),
        updateClientStatus: builder.mutation<IClientUserGet, { clientId: number; is_active: boolean}>({
            query: ({clientId, is_active}) => ({
                url: `/clients/${clientId}/status`,
                method: 'PATCH',
                body: {is_active},
            }),
            invalidatesTags: (_, __, { clientId }) => [{ type: 'Client', id: clientId }, {type: 'Client', id: 'LIST'}],
        }),
        deleteClient: builder.mutation<void, { clientId: number}>({
            query: ({clientId}) => ({
                url: `/clients/${clientId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_, __, {clientId}) => [{type: 'Client', id: clientId}, {type: 'Client', id: 'LIST'}],
        }),
    }),
});

export const { 
    useCreateClientMutation, 
    useGetClientsQuery, 
    useGetClientQuery,
    useGetClientStudentsQuery, 
    useUpdateClientMutation, 
    useDeleteClientMutation, 
    useUpdateClientStatusMutation
} = clientsApi;