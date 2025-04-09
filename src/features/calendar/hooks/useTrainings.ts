import {
    useGetTrainingsQuery,
    useCreateTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation
} from "../../../store/apis/trainings.ts";

export const useTrainings = () => {
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
    } = useGetTrainingsQuery();

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

    return {
        createTraining,
        updateTraining,
        deleteTraining,
        refetchTrainings,

        trainings,
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