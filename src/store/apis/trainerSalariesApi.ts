
import { baseApi } from './api';
import { ITrainerTrainingTypeSalary } from '../../features/trainers/models/trainer';

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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetTrainerSalariesQuery,
  useAddTrainerSalaryMutation,
  useUpdateTrainerSalaryMutation,
  useDeleteTrainerSalaryMutation,
} = trainerSalariesApi;
