import { baseApi } from '../../store/apis/api';
import {
    IAdminResponse,
    IAdminCreatePayload,
    IAdminUpdatePayload,
    IAdminStatusUpdatePayload,
    IAdminsList,
    IAdminDashboardStats,
    IOwnerDashboardStats,
} from '../../features/admin-management/models/admin';

export const adminManagementApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Admin CRUD endpoints
        getAdmins: builder.query<IAdminsList, void>({
            query: () => '/admin-management/admins',
            providesTags: (result) =>
                result
                    ? [
                          ...result.admins.map(({ id }) => ({ type: 'Admin' as const, id })),
                          { type: 'Admin', id: 'LIST' },
                      ]
                    : [{ type: 'Admin', id: 'LIST' }],
        }),
        getAdminById: builder.query<IAdminResponse, number>({
            query: (adminId) => `/admin-management/admins/${adminId}`,
            providesTags: (_, __, adminId) => [{ type: 'Admin', id: adminId }],
        }),
        createAdmin: builder.mutation<IAdminResponse, IAdminCreatePayload>({
            query: (adminData) => ({
                url: '/admin-management/admins',
                method: 'POST',
                body: adminData,
            }),
            invalidatesTags: [{ type: 'Admin', id: 'LIST' }],
        }),
        updateAdmin: builder.mutation<IAdminResponse, { adminId: number; adminData: IAdminUpdatePayload }>({
            query: ({ adminId, adminData }) => ({
                url: `/admin-management/admins/${adminId}`,
                method: 'PATCH',
                body: adminData,
            }),
            invalidatesTags: (_, __, { adminId }) => [
                { type: 'Admin', id: adminId },
                { type: 'Admin', id: 'LIST' },
            ],
        }),
        updateAdminStatus: builder.mutation<IAdminResponse, { adminId: number; statusData: IAdminStatusUpdatePayload }>({
            query: ({ adminId, statusData }) => ({
                url: `/admin-management/admins/${adminId}/status`,
                method: 'PATCH',
                body: statusData,
            }),
            invalidatesTags: (_, __, { adminId }) => [
                { type: 'Admin', id: adminId },
                { type: 'Admin', id: 'LIST' },
            ],
        }),

        // Dashboard stats endpoints
        getAdminDashboardStats: builder.query<
            IAdminDashboardStats,
            { start_date?: string; end_date?: string; interval?: string }
        >({
            query: (params) => ({
                url: '/stats/admin-dashboard',
                params,
            }),
            providesTags: ['AdminStats'],
        }),
        getOwnerDashboardStats: builder.query<
            IOwnerDashboardStats,
            { start_date?: string; end_date?: string; interval?: string }
        >({
            query: (params) => ({
                url: '/stats/owner-dashboard',
                params,
            }),
            providesTags: ['OwnerStats'],
        }),
    }),
});

export const {
    useGetAdminsQuery,
    useGetAdminByIdQuery,
    useCreateAdminMutation,
    useUpdateAdminMutation,
    useUpdateAdminStatusMutation,
    useGetAdminDashboardStatsQuery,
    useGetOwnerDashboardStatsQuery,
} = adminManagementApi;
