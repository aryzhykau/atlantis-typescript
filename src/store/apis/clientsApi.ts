import {IClient, IClientGet, IClientSubscriptionCreate, IClientUser, IClientUserGet} from "../../features/clients/models/client.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {baseApi} from "./api.ts";

dayjs.extend(utc);
dayjs.extend(timezone);


export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getClients: builder.query<IClientUserGet[], void>({
            query: () => ({
                url: '/clients',
                method: 'GET',
                providesTags: ['Client'],  
            }),

            transformResponse: (response: IClientUserGet[]) => {
                console.log(response);
                const newResp = response.map((clientUser) => {
                    const formattedClientUser = {
                        ...clientUser,
                        birth_date: dayjs(clientUser.birth_date).tz(dayjs.tz.guess()).format(),
                        clients: clientUser.clients.map((client)=> {
                            const  formattedClient = {
                                ...client, 
                                birth_date: dayjs(clientUser.birth_date).tz(dayjs.tz.guess()).format(),
                            } 
                            return formattedClient;
                        })
                    };

                    // if (client.active_subscription) {
                    //     formattedClient.active_subscription = {
                    //         ...client.active_subscription,
                    //         start_date: dayjs(client.active_subscription.start_date)
                    //             .tz(dayjs.tz.guess())
                    //             .format(),
                    //         end_date: dayjs(client.active_subscription.end_date)
                    //             .tz(dayjs.tz.guess())
                    //             .format(),
                    //     };
                    // }

                    return formattedClientUser;
                });
                console.log(newResp);
                return newResp;
            }

        }),
        createClient: builder.mutation<IClient, {clientData: IClientUser}>({
            query: ({clientData}) =>  ({
                url: '/clients',
                method: 'POST',
                body: clientData,
            })
        }),

        updateClient: builder.mutation<IClient, { clientId: number; clientData: IClient}>({
            query: ({clientId, clientData}) => ({
                url: `/clients/${clientId}`,
                method: 'PUT',
                body: {
                    ...clientData,
                    birth_date: dayjs(clientData.birth_date).tz(dayjs.tz.guess()).format(),
                },
            }),
        }),

        addClientSubscription: builder.mutation<IClientGet, {clientId: number, data: IClientSubscriptionCreate}>({
            query: ({clientId, data}) => ({
                url: `/clients/${clientId}/subscriptions`,
                method: 'POST',
                body: data,
            }),

        }),

        // deleteClient: builder.mutation<void, { clientId: number}>({
        //     query: ({clientId}) => ({
        //         url: `/clients/${clientId}`,
        //         method: 'DELETE',
        //     }),
        // }),
        
    }),
});

export const { useCreateClientMutation, useGetClientsQuery, useUpdateClientMutation, useAddClientSubscriptionMutation } = clientsApi;