import { baseApi } from './api'; // Assuming you have this
import { ITrainingType, ITrainingTypeCreate, ITrainingTypeUpdate, ITrainingTypesList } from '../../features/training-types/models/trainingType';

export const trainingTypesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTrainingTypes: builder.query<ITrainingType[], { skip?: number; limit?: number }>({
            query: ({ skip = 0, limit = 100 }: { skip?: number; limit?: number } = {}) => `training_types/?skip=${skip}&limit=${limit}`,
            transformResponse: (response: ITrainingTypesList) => response.training_types,
            providesTags: (result: ITrainingType[] | undefined) => 
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'TrainingType' as const, id })),
                          { type: 'TrainingType', id: 'LIST' },
                      ]
                    : [{ type: 'TrainingType', id: 'LIST' }],
        }),
        getTrainingTypeById: builder.query<ITrainingType, number>({
            query: (id: number) => `training_types/${id}`,
            providesTags: (_, __, id: number) => [{ type: 'TrainingType', id }],
        }),
        createTrainingType: builder.mutation<ITrainingType, ITrainingTypeCreate>({
            query: (newTrainingType: ITrainingTypeCreate) => ({
                url: 'training_types/',
                method: 'POST',
                body: newTrainingType,
            }),
            invalidatesTags: [{ type: 'TrainingType', id: 'LIST' }],
        }),
        updateTrainingType: builder.mutation<ITrainingType, { id: number; payload: ITrainingTypeUpdate }>({
            query: ({ id, payload }: { id: number; payload: ITrainingTypeUpdate }) => ({
                url: `training_types/${id}`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (_, __, { id }: { id: number }) => [{ type: 'TrainingType', id }, { type: 'TrainingType', id: 'LIST' }],
        }),
        // No dedicated delete endpoint found in openapi.json.
        // Status change (is_active) is handled by updateTrainingType.
    }),
});

export const {
    useGetTrainingTypesQuery,
    useGetTrainingTypeByIdQuery,
    useCreateTrainingTypeMutation,
    useUpdateTrainingTypeMutation,
} = trainingTypesApi;