import { baseApi } from "./api.ts";
import {
    IStudent,
    IStudentCreatePayload,
    IStudentStatusResponse,
    IStudentStatusUpdatePayload,
    IStudentUpdatePayload
} from "../../features/students/models/student.ts";

export const studentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStudents: builder.query<IStudent[], void>({
            query: () => '/students',
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Students' as const, id })),
                        { type: 'Students', id: 'LIST' },
                    ]
                    : [{ type: 'Students', id: 'LIST' }],
        }),
        getStudentById: builder.query<IStudent, number>({
            query: (id) => `/students/${id}`,
            providesTags: (result, error, id) => [{ type: 'Students', id }],
        }),
        createStudent: builder.mutation<IStudent, IStudentCreatePayload>({
            query: (studentData) => ({
                url: '/students',
                method: 'POST',
                body: studentData,
            }),
            invalidatesTags: [{ type: 'Students', id: 'LIST' }, {type: 'Client', id: 'LIST'}]
        }),
        updateStudent: builder.mutation<IStudent, { id: number; studentData: IStudentUpdatePayload }>({
            query: ({ id, studentData }) => ({
                url: `/students/${id}`,
                method: 'PATCH',
                body: studentData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }, { type: 'Students', id: 'LIST' }, {type: 'Client', id: 'LIST'}],
        }),
        updateStudentStatus: builder.mutation<IStudentStatusResponse, { id: number; statusData: IStudentStatusUpdatePayload }>({
            query: ({ id, statusData }) => ({
                url: `/students/${id}/status`,
                method: 'PATCH',
                body: statusData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }, { type: 'Students', id: 'LIST' }, {type: 'Client', id: 'LIST'}],
        }),
        // Эндпоинт getClientStudents остается в clientsApi.ts, чтобы не дублировать
        // и не ломать существующую логику ClientPage.
        // Если понадобится специфичная версия для студентов, можно добавить здесь.

        // Эндпоинт для добавления абонемента студенту (`addStudentSubscription`)
        // будет находиться в `subscriptionsApi.ts`, так как он относится к управлению абонементами.
    }),
});

export const {
    useGetStudentsQuery,
    useLazyGetStudentsQuery,
    useGetStudentByIdQuery,
    useLazyGetStudentByIdQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useUpdateStudentStatusMutation,
} = studentsApi;