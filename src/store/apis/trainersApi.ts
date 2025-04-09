import {ITrainer, ITrainerGet} from "../../features/trainers/models/trainer.ts";
import {baseApi} from "./api.ts";

export const trainersApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getTrainers: builder.query<ITrainerGet[], void>({
            query: () => ({
                url: '/trainers',
                method: 'GET',
                 // отправляешь токен Google на сервер
            }),
        }),
        createTrainer: builder.mutation<ITrainer, {trainerData: ITrainer }>({
            query: ({trainerData, }) =>  ({
                url: '/trainers',
                method: 'POST',

                body: trainerData,
            })
        }),

        updateTrainer: builder.mutation<ITrainer, { trainerId: number; trainerData: ITrainer; }>({
            query: ({trainerId, trainerData}) => ({
                url: `/trainers/${trainerId}`,
                method: 'PUT',
                body: trainerData,
            }),
        }),
        deleteTrainer: builder.mutation<void, { trainerId: number }>({
            query: ({trainerId, }) => ({
                url: `/trainers/${trainerId}`,
                method: 'DELETE',

            }),
        }),
        
    }),
});

export const { useCreateTrainerMutation, useGetTrainersQuery, useDeleteTrainerMutation, useUpdateTrainerMutation } = trainersApi;