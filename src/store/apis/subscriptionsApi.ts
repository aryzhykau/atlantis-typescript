import {ISubscription, ISubscriptionGet} from "../../features/subscriptions/models/subscription.ts";
import {baseApi} from "./api.ts";

export const subscriptionsApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getSubscriptions: builder.query<ISubscriptionGet[], void>({
            query: () => ({
                url: '/subscriptions',
                method: 'GET',
            }),
        }),
        createSubscription: builder.mutation<ISubscriptionGet, {subscriptionData: ISubscription;}>({
            query: ({subscriptionData}) =>  ({
                url: '/subscriptions',
                method: 'POST',
                body: subscriptionData,
            })
        }),

        updateSubscription: builder.mutation<ISubscriptionGet, { subscriptionId: number; subscriptionData: ISubscription;}>({
            query: ({subscriptionId, subscriptionData}) => ({
                url: `/subscriptions/${subscriptionId}`,
                method: 'PUT',
                body: subscriptionData,
            }),
        }),

        deleteSubscription: builder.mutation<void, { subscriptionId: number;}>({
            query: ({subscriptionId}) => ({
                url: `/subscriptions/${subscriptionId}`,
                method: 'DELETE',
            }),
        }),

    }),
});

export const { useCreateSubscriptionMutation, useGetSubscriptionsQuery, useUpdateSubscriptionMutation, useDeleteSubscriptionMutation } = subscriptionsApi;