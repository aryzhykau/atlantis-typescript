import {
    useGetTrainingsQuery,
    useCreateTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation
} from "../../../store/apis/trainings.ts";
import {useMemo} from "react";
import {ITrainingGet} from "../models/training.ts";

export const useTrainings = (trainer_id?: number, start_week?: string, end_week?: string) => {
    // Создание тренировки

    const [
        createTraining,
        {
            data: createdTraining,
            isLoading: isCreateLoading,
            isError: isCreateError,
            isSuccess: isCreateSuccess,
            error: createError,
        }
    ] = useCreateTrainingMutation();

    // Получение тренировок
    const {
        data: trainings = [],
        isLoading,
        isError,
        isSuccess,
        error,
        refetch: refetchTrainings
    } = useGetTrainingsQuery({trainer_id, start_week, end_week}, {refetchOnMountOrArgChange: true});

    // Обновление тренировки
    const [
        updateTraining,
        {
            data: updatedTraining,
            isLoading: isUpdateLoading,
            isError: isUpdateError,
            isSuccess: isUpdateSuccess,
            error: updateError,
        }
    ] = useUpdateTrainingMutation();

    // Удаление тренировки
    const [
        deleteTraining,
        {
            isLoading: isDeleteLoading,
            isError: isDeleteError,
            isSuccess: isDeleteSuccess,
            error: deleteError,
        }
    ] = useDeleteTrainingMutation();

    // Преобразование тренировок в формат, сгруппированный по дате
    const groupedTrainingsByDate = useMemo(() => {
        console.log("trainings have been changed")
        return trainings.reduce((acc: Record<string, ITrainingGet[]>, training) => {
            const date = training.training_datetime.split('T')[0]; // Извлекаем только дату (без времени)
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(training);
            return acc;
        }, {});
    }, [trainings]);

    return {
        createTraining,
        updateTraining,
        deleteTraining,
        refetchTrainings,


        trainings,
        groupedTrainingsByDate, // Добавили сгруппированные тренировки
        createdTraining,
        updatedTraining,

        isLoading,
        isError,
        isSuccess,
        error,

        isCreateLoading,
        isCreateError,
        isCreateSuccess,
        createError,

        isUpdateLoading,
        isUpdateError,
        isUpdateSuccess,
        updateError,

        isDeleteLoading,
        isDeleteError,
        isDeleteSuccess,
        deleteError,
    };
};