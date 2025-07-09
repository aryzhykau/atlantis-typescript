import {ITraining, ITrainingGet} from "../../features/calendar/models/training.ts";
import {baseApi} from "./api.ts";
import dayjs from "dayjs";

export const TrainingsApi = baseApi.injectEndpoints({

    endpoints: (builder) => ({
        getTrainings: builder.query<ITrainingGet[], {trainer_id?: number, start_week?: string, end_week?: string}>({
            query: ({trainer_id, start_week, end_week}) => ({
                url: '/trainings',
                method: 'GET',
                params: {
                    trainer_id,
                    start_week,
                    end_week,
                }
            }),
            transformResponse: (response: ITrainingGet[]) => {
                console.log(response);
                const newResp = response.map((training) => {
                    return {
                        ...training,
                        created_at: dayjs(training.created_at).tz(dayjs.tz.guess()).format(),
                        training_datetime: dayjs(training.training_datetime).tz(dayjs.tz.guess()).format(),
                        students: training.students?.map(student => {
                            return {
                                ...student,
                                student: student.student ? {
                                    ...student.student,
                                    birth_date: student.student.birth_date ? dayjs(student.student.birth_date).tz(dayjs.tz.guess()).format() : undefined
                                } : undefined
                            }
                        }) || []
                    };
                });
                console.log(newResp);
                return newResp;
            }

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