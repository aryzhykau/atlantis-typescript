import {ITraining, ITrainingGet} from "../../features/calendar/models/training.ts";
import {baseApi} from "./api.ts";

export const TrainingsApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getTrainings: builder.query<ITrainingGet[], void>({
            query: () => ({
                url: '/trainings',
                method: 'GET',
            }),
        }),
        createTraining: builder.mutation<ITrainingGet, {trainingData: ITraining;}>({
            query: ({trainingData}) =>  ({
                url: '/trainings',
                method: 'POST',
                body: trainingData,
            })
        }),

        updateTraining: builder.mutation<ITrainingGet, { trainingId: number; trainingData: ITraining;}>({
            query: ({trainingId, trainingData}) => ({
                url: `/trainings/${trainingId}`,
                method: 'PUT',
                body: trainingData,
            }),
        }),

        deleteTraining: builder.mutation<void, { trainingId: number;}>({
            query: ({trainingId}) => ({
                url: `/trainings/${trainingId}`,
                method: 'DELETE',
            }),
        }),

    }),
});

export const { useCreateTrainingMutation, useGetTrainingsQuery, useUpdateTrainingMutation, useDeleteTrainingMutation } = TrainingsApi;