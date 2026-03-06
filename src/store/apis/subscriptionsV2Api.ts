import { baseApi } from './api.ts';
import {
    IStudentSubscriptionV2Response,
    IStudentSubscriptionCreateV2Payload,
    IMissedSession,
    ISystemSetting,
    ISystemSettingUpdate,
} from '../../features/subscriptions/models/subscription_v2.ts';

export const subscriptionsV2Api = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // --- Subscriptions V2 ---

        addSubscriptionToStudentV2: builder.mutation<
            IStudentSubscriptionV2Response,
            IStudentSubscriptionCreateV2Payload
        >({
            query: (payload) => ({
                url: '/v2/subscriptions/student',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result) =>
                result
                    ? [
                        { type: 'StudentSubscriptionsV2', id: 'LIST_FOR_STUDENT_' + result.student_id },
                        { type: 'StudentSubscriptionsV2', id: 'LIST' },
                        { type: 'StudentSubscriptions', id: 'LIST_FOR_STUDENT_' + result.student_id },
                        { type: 'StudentSubscriptions', id: 'LIST' },
                        { type: 'Students', id: result.student_id },
                      ]
                    : [],
        }),

        getStudentSubscriptionsV2: builder.query<
            { items: IStudentSubscriptionV2Response[]; total: number },
            { studentId: number }
        >({
            query: ({ studentId }) => `/v2/subscriptions/student/${studentId}`,
            providesTags: (result, __, { studentId }) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'StudentSubscriptionsV2' as const, id })),
                        { type: 'StudentSubscriptionsV2' as const, id: 'LIST_FOR_STUDENT_' + studentId },
                      ]
                    : [{ type: 'StudentSubscriptionsV2' as const, id: 'LIST_FOR_STUDENT_' + studentId }],
        }),

        // --- Missed Sessions ---

        getMissedSessions: builder.query<
            { items: IMissedSession[]; total: number },
            { studentId: number; isExcused?: boolean; isMadeUp?: boolean }
        >({
            query: ({ studentId, isExcused, isMadeUp }) => {
                const params = new URLSearchParams();
                if (isExcused !== undefined) params.append('is_excused', String(isExcused));
                if (isMadeUp !== undefined) params.append('is_made_up', String(isMadeUp));
                const qs = params.toString();
                return `/v2/missed-sessions/student/${studentId}${qs ? `?${qs}` : ''}`;
            },
            providesTags: (result, __, { studentId }) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'MissedSession' as const, id })),
                        { type: 'MissedSession' as const, id: 'LIST_FOR_STUDENT_' + studentId },
                      ]
                    : [{ type: 'MissedSession' as const, id: 'LIST_FOR_STUDENT_' + studentId }],
        }),

        excuseMissedSession: builder.mutation<IMissedSession, { id: number }>({
            query: ({ id }) => ({
                url: `/v2/missed-sessions/${id}/excuse`,
                method: 'POST',
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: 'MissedSession', id },
                { type: 'MissedSession', id: 'LIST' },
            ],
        }),

        // --- System Settings ---

        getSystemSettings: builder.query<ISystemSetting[], void>({
            query: () => '/v2/system-settings',
            providesTags: () => [{ type: 'SystemSettings', id: 'LIST' }],
        }),

        updateSystemSetting: builder.mutation<ISystemSetting, ISystemSettingUpdate>({
            query: (payload) => ({
                url: '/v2/system-settings',
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: [{ type: 'SystemSettings', id: 'LIST' }],
        }),
    }),
});

export const {
    useAddSubscriptionToStudentV2Mutation,
    useGetStudentSubscriptionsV2Query,
    useGetMissedSessionsQuery,
    useExcuseMissedSessionMutation,
    useGetSystemSettingsQuery,
    useUpdateSystemSettingMutation,
} = subscriptionsV2Api;
