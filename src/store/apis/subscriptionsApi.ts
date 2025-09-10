import {
    ISubscriptionListResponse,
    ISubscriptionCreatePayload,
    ISubscriptionResponse,
    ISubscriptionUpdatePayload,
    IStudentSubscriptionCreatePayload,
    IStudentSubscriptionResponse,
    IStudentSubscriptionFreezePayload,
    IStudentSubscriptionAutoRenewalUpdatePayload
} from "../../features/subscriptions/models/subscription.ts";
import { baseApi } from "./api.ts";

export const subscriptionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubscriptions: builder.query<ISubscriptionListResponse, void>({
            query: () => '/subscriptions',
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Subscription' as const, id })),
                        { type: 'Subscription', id: 'LIST' },
                    ]
                    : [{ type: 'Subscription', id: 'LIST' }],
        }),
        getSubscriptionById: builder.query<ISubscriptionResponse, number>({
            query: (id) => `/subscriptions/${id}`,
            providesTags: (_, __, id) => [{ type: 'Subscription', id }],
        }),
        createSubscription: builder.mutation<ISubscriptionResponse, ISubscriptionCreatePayload>({
            query: (payload) => ({
                url: '/subscriptions',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'Subscription', id: 'LIST' }],
        }),
        updateSubscription: builder.mutation<ISubscriptionResponse, { id: number; payload: ISubscriptionUpdatePayload }>({
            query: ({ id, payload }) => ({
                url: `/subscriptions/${id}`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: 'Subscription', id }, { type: 'Subscription', id: 'LIST' }],
        }),
        deleteSubscription: builder.mutation<void, { subscriptionId: number }>({
            query: ({ subscriptionId }) => ({
                url: `/subscriptions/${subscriptionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_, __, { subscriptionId }) => [{ type: 'Subscription', id: subscriptionId }, { type: 'Subscription', id: 'LIST' }],
        }),
        getStudentSubscriptions: builder.query<IStudentSubscriptionResponse[], { 
            studentId: number; 
            status?: string; 
            includeExpired?: boolean 
        }>({
            query: ({ studentId, status, includeExpired = true }) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                if (includeExpired !== undefined) params.append('include_expired', includeExpired.toString());
                
                const queryString = params.toString();
                return `/subscriptions/student/${studentId}${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: (result, __, { studentId }) => 
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'StudentSubscriptions' as const, id: id.toString() + '-student-' + studentId.toString() })),
                        { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + studentId },
                        { type: 'StudentSubscriptions', id: 'LIST' }
                      ]
                    : [{ type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + studentId }, { type: 'StudentSubscriptions', id: 'LIST' }],
        }),
        addSubscriptionToStudent: builder.mutation<IStudentSubscriptionResponse, IStudentSubscriptionCreatePayload>({
            query: (payload) => ({
                url: '/subscriptions/student',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result) => 
                result 
                    ? [
                        { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + result.student_id }, 
                        { type: 'StudentSubscriptions', id: 'LIST' },
                        { type: 'Students', id: result.student_id },
                        { type: 'Client', id: 'LIST' }
                      ]
                    : [],
        }),
        freezeStudentSubscription: builder.mutation<IStudentSubscriptionResponse, { studentSubscriptionId: number; payload: IStudentSubscriptionFreezePayload }>({
            query: ({ studentSubscriptionId, payload }) => ({
                url: `/subscriptions/student/${studentSubscriptionId}/freeze`,
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result, __, { studentSubscriptionId }) => 
                result 
                ? [
                    { type: 'StudentSubscriptions', id: studentSubscriptionId.toString() + '-student-' + result.student_id.toString() },
                    { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + result.student_id },
                    { type: 'StudentSubscriptions', id: 'LIST' },
                    { type: 'Students', id: result.student_id },
                  ]
                : [],
        }),
        unfreezeStudentSubscription: builder.mutation<IStudentSubscriptionResponse, { studentSubscriptionId: number; studentId: number }>({
            query: ({ studentSubscriptionId }) => ({
                url: `/subscriptions/student/${studentSubscriptionId}/unfreeze`,
                method: 'POST',
            }),
            invalidatesTags: (result, __, { studentSubscriptionId, studentId }) => 
                result
                ? [
                    { type: 'StudentSubscriptions', id: studentSubscriptionId.toString() + '-student-' + studentId.toString() },
                    { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + studentId },
                    { type: 'StudentSubscriptions', id: 'LIST' },
                    { type: 'Students', id: studentId },
                  ]
                : [],
        }),
        updateStudentSubscriptionAutoRenewal: builder.mutation<IStudentSubscriptionResponse, { studentSubscriptionId: number; payload: IStudentSubscriptionAutoRenewalUpdatePayload }>({
            query: ({ studentSubscriptionId, payload }) => ({
                url: `/subscriptions/student/${studentSubscriptionId}/auto-renewal`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (result, __, { studentSubscriptionId }) => 
                result 
                ? [
                    { type: 'StudentSubscriptions', id: studentSubscriptionId.toString() + '-student-' + result.student_id.toString() },
                    { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + result.student_id },
                    { type: 'StudentSubscriptions', id: 'LIST' },
                  ]
                : [],
        }),
    }),
});

export const {
    useGetSubscriptionsQuery,
    useLazyGetSubscriptionsQuery,
    useGetSubscriptionByIdQuery,
    useLazyGetSubscriptionByIdQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation,
    useGetStudentSubscriptionsQuery,
    useLazyGetStudentSubscriptionsQuery,
    useAddSubscriptionToStudentMutation,
    useFreezeStudentSubscriptionMutation,
    useUnfreezeStudentSubscriptionMutation,
    useUpdateStudentSubscriptionAutoRenewalMutation,
} = subscriptionsApi;