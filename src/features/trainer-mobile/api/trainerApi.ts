import { baseApi } from '../../../store/apis/api';
import { TrainerTraining, AttendanceUpdate, QuickPayment, TrainerStats } from '../models';

export const trainerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение тренировок тренера за день
    getTrainerTrainings: builder.query<TrainerTraining[], { date?: string }>({
      query: ({ date }) => ({
        url: '/real-trainings/',
        params: {
          start_date: date,
          end_date: date,
          with_students: true,
        },
      }),
      providesTags: ['RealTrainingV2'],
    }),

    // Получение тренировок тренера за период (неделя)
    getTrainerTrainingsRange: builder.query<TrainerTraining[], { 
      start_date: string;
      end_date: string;
    }>({
      query: ({ start_date, end_date }) => ({
        url: '/real-trainings/',
        params: {
          start_date,
          end_date,
          with_students: true,
        },
      }),
      providesTags: ['RealTrainingV2'],
    }),

    // Отметка посещаемости студента
    updateStudentAttendance: builder.mutation<any, {
      training_id: number;
      student_id: number;
      data: AttendanceUpdate;
    }>({
      query: ({ training_id, student_id, data }) => ({
        url: `/real-trainings/${training_id}/students/${student_id}/attendance`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['RealTrainingV2'],
    }),

    // Регистрация платежа (используем существующий payments API)
    createQuickPayment: builder.mutation<any, QuickPayment>({
      query: (payment) => ({
        url: '/payments/',
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Payment'],
    }),

    // Получение платежей тренера
    getTrainerPayments: builder.query<any[], { period?: 'week' | 'month' | '3months' }>({
      query: ({ period = 'week' }) => ({
        url: '/payments/filtered',
        params: {
          registered_by_me: true,
          period,
        },
      }),
      providesTags: ['Payment'],
    }),

    // Получение статистики тренера
    getTrainerStats: builder.query<TrainerStats, { period?: 'today' | 'week' | 'month' }>({
      query: ({ period = 'week' }) => ({
        url: `/trainers/me/stats?period=${period}`,
      }),
      providesTags: ['TrainerStats'],
    }),

    // Получение студентов тренера
    getTrainerStudents: builder.query<any[], { trainer_id: number }>({
      query: ({ trainer_id }) => ({
        url: `/students/trainer/${trainer_id}`,
        method: 'GET',
      }),
      providesTags: ['Students'],
    }),
  }),
});

export const {
  useGetTrainerTrainingsQuery,
  useGetTrainerTrainingsRangeQuery,
  useUpdateStudentAttendanceMutation,
  useCreateQuickPaymentMutation,
  useGetTrainerPaymentsQuery,
  useGetTrainerStatsQuery,
  useGetTrainerStudentsQuery,
} = trainerApi; 