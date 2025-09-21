
import { baseApi } from './api';
import { ITrainerTrainingTypeSalary } from '../../features/trainers/models/trainer';
import { TrainerSalarySummary, SalaryCalculationPreview, TrainerSalaryPreviewResponse } from '../../features/calendar-v2/models/realTraining';

// Interfaces for API payloads
interface ITrainerSalaryCreatePayload {
  trainer_id: number;
  training_type_id: number;
  salary: number;
}

interface ITrainerSalaryUpdatePayload {
  salary: number;
}

// Define a service using a base URL and expected endpoints
export const trainerSalariesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrainerSalaries: builder.query<ITrainerTrainingTypeSalary[], number>({
      query: (trainerId) => `/trainers/${trainerId}/salaries`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TrainerSalary' as const, id })),
              { type: 'TrainerSalary', id: 'LIST' },
            ]
          : [{ type: 'TrainerSalary', id: 'LIST' }],
    }),
    addTrainerSalary: builder.mutation<ITrainerTrainingTypeSalary, { trainerId: number; data: ITrainerSalaryCreatePayload }>({
      query: ({ trainerId, data }) => ({
        url: `/trainers/${trainerId}/salaries`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TrainerSalary', id: 'LIST' }],
    }),
    updateTrainerSalary: builder.mutation<ITrainerTrainingTypeSalary, { salaryId: number; data: ITrainerSalaryUpdatePayload }>({
      query: ({ salaryId, data }) => ({
        url: `/trainers/salaries/${salaryId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { salaryId }) => [{ type: 'TrainerSalary', id: salaryId }],
    }),
    deleteTrainerSalary: builder.mutation<void, number>({
      query: (salaryId) => ({
        url: `/trainers/salaries/${salaryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, salaryId) => [{ type: 'TrainerSalary', id: salaryId }],
    }),
    
    // Get trainer salary summary for a period
    getTrainerSalarySummary: builder.query<TrainerSalarySummary, {
      trainerId: number;
      startDate: string; // YYYY-MM-DD format
      endDate: string;   // YYYY-MM-DD format
    }>({
      query: ({ trainerId, startDate, endDate }) => 
        `/trainers/${trainerId}/salary-summary?start_date=${startDate}&end_date=${endDate}`,
      providesTags: (_, __, { trainerId }) => [
        { type: 'TrainerSalary', id: `SUMMARY_${trainerId}` }
      ],
    }),

    // Calculate salary for training cancellation (preview)
    calculateTrainingSalary: builder.mutation<SalaryCalculationPreview, {
      trainingId: number;
      cancelledStudentId: number;
      cancellationTime: string; // ISO string
    }>({
      query: ({ trainingId, cancelledStudentId, cancellationTime }) => ({
        url: `/trainings/${trainingId}/calculate-salary`,
        method: 'POST',
        body: {
          cancelled_student_id: cancelledStudentId,
          cancellation_time: cancellationTime,
        },
      }),
    }),

    // Get trainer salary preview for a specific date
    getSalaryPreview: builder.query<TrainerSalaryPreviewResponse, {
      trainerId: number;
      previewDate: string; // YYYY-MM-DD format
    }>({
      query: ({ trainerId, previewDate }) => 
        `/trainers/${trainerId}/salary/preview?preview_date=${previewDate}`,
      providesTags: (_, __, { trainerId, previewDate }) => [
        { type: 'TrainerSalary', id: `PREVIEW_${trainerId}_${previewDate}` }
      ],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetTrainerSalariesQuery,
  useAddTrainerSalaryMutation,
  useUpdateTrainerSalaryMutation,
  useDeleteTrainerSalaryMutation,
  useGetTrainerSalarySummaryQuery,
  useCalculateTrainingSalaryMutation,
  useGetSalaryPreviewQuery,
} = trainerSalariesApi;
