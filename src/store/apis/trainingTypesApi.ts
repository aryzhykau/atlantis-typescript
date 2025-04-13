import {ITrainingType, ITrainingTypeGet} from "../../features/trainingTypes/models/trainingType.ts";
import {baseApi} from "./api.ts";

export const trainingTypesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTrainingTypes: builder.query<ITrainingTypeGet[], void>({
            query: () => ({
                url: '/training_types',
                method: 'GET',
            }),
        }),
        getTrainingType: builder.query<ITrainingTypeGet, number>({
            query: (id) => ({
                url: `/training_types/${id}`,
                method: 'GET',
            }),
        }),
        createTrainingType: builder.mutation<ITrainingTypeGet, {trainingTypeData: ITrainingType; }>({
            query: ({trainingTypeData}) =>  ({
                url: '/training_types',
                method: 'POST',
                body: trainingTypeData,
            })
        }),

        updateTrainingType: builder.mutation<ITrainingType, { trainingTypeId: number; trainingTypeData: ITrainingType;}>({
            query: ({trainingTypeId, trainingTypeData}) => ({
                url: `/training_types/${trainingTypeId}`,
                method: 'PUT',
                body: trainingTypeData,
            }),
        }),

        deleteTrainingType: builder.mutation<void, { trainingTypeId: number }>({
            query: ({trainingTypeId}) => ({
                url: `/training_types/${trainingTypeId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useCreateTrainingTypeMutation, useGetTrainingTypesQuery, useGetTrainingTypeQuery, useUpdateTrainingTypeMutation, useDeleteTrainingTypeMutation } = trainingTypesApi;