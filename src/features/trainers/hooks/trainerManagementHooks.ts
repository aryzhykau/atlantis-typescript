import {
    useGetTrainersQuery,
    useCreateTrainerMutation, useUpdateTrainerMutation, useDeleteTrainerMutation,
} from '../../../store/apis/trainersApi.ts';
import {ITrainer} from '../models/trainer.ts';
import {useEffect, useState} from "react";

export const useTrainers = () => {
    // Получение списка тренеров
    const {
        data: trainers = [],
        isLoading: isLoadingTrainers,
        isError: isErrorTrainers,
        error: trainersError,
        refetch: refetchTrainers,
    } = useGetTrainersQuery();
    const [displayTrainers, setDisplayTrainers] = useState<ITrainer[]>([]);

    useEffect(() => {
        setDisplayTrainers(trainers)
    }, [trainers])
    // Мутация создания тренера
    const [createTrainer, {
        isLoading: isCreatingTrainer,
        isError: isCreateError,
        error: createTrainerError,
        isSuccess: isCreateSuccess
    }] = useCreateTrainerMutation();

    //Trainer update mutation
    const [updateTrainer, {
        isLoading: isUpdatingTrainer,
        isError: isUpdateError,
        error: trainerUpdateError,
        isSuccess: isUpdateSuccess
    }] = useUpdateTrainerMutation();

    const [deleteTrainer, {
        isLoading: isDeletingTrainer,
        isError: isDeleteError,
        error: deleteTrainerError,
        isSuccess: isDeleteSuccess
    }] = useDeleteTrainerMutation();

    // Функция-обертка для удаления тренера
    // const removeTrainer = async (trainerId: number) => {
    //   try {
    //     await deleteTrainer({ trainerId, token }).unwrap();
    //   } catch (error) {
    //     console.error('Ошибка при удалении тренера:', error);
    //     throw error;
    //   }
    // };

    return {
        // Данные тренеров
        trainers,
        displayTrainers,
        setDisplayTrainers,

        // Методы работы с тренерами
        createTrainer,
        updateTrainer,
        deleteTrainer,
        refetchTrainers,

        // Состояния загрузки для тренеров
        isLoadingTrainers,
        isCreatingTrainer,
        isUpdatingTrainer,
        isDeletingTrainer,

        // Состояния ошибки
        isErrorTrainers,
        isCreateError,
        isUpdateError,
        isDeleteError,

        //Успешные состояния
        isCreateSuccess,
        isUpdateSuccess,
        isDeleteSuccess,

        //Сами ошибки
        trainersError,
        trainerUpdateError,
        createTrainerError,
        deleteTrainerError
    };
};