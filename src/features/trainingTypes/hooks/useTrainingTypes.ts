import {
    useGetTrainingTypesQuery,
    useCreateTrainingTypeMutation,
    useDeleteTrainingTypeMutation, useUpdateTrainingTypeMutation
} from "../../../store/apis/trainingTypesApi.ts";


export const useTrainingTypes = () => {
    const [
        createTrainingType,
        {
            data: createdTrainingType,
            isSuccess: isCreateSuccess,
            isError: isCreateError,
            error: createError,
            isLoading: isCreateLoading
        }
        ] = useCreateTrainingTypeMutation();

    const {data: trainingTypes = [], isLoading, isError, isSuccess, error, refetch: refetchTrainingTypes} = useGetTrainingTypesQuery();
    const  [deleteTrainingType, {isLoading: isDeleteLoading, isError: isDeleteError, isSuccess: isDeleteSuccess, data: deleteData, error: deleteError}] = useDeleteTrainingTypeMutation();
    const [updateTrainingType, {isLoading: isUpdateLoading, isError: isUpdateError, isSuccess: isUpdateSuccess, error: updateError, data: updateData}] = useUpdateTrainingTypeMutation();

    return {
        createTrainingType,
        deleteTrainingType,
        updateTrainingType,
        trainingTypes,
        updateData,
        deleteData,
        refetchTrainingTypes,
        isCreateSuccess,
        isCreateError,
        isCreateLoading,
        isLoading,
        createdTrainingType,
        isSuccess,
        isError,
        deleteError,
        isDeleteLoading,
        isDeleteError,
        isDeleteSuccess,
        isUpdateError,
        isUpdateLoading,
        isUpdateSuccess,
        updateError,
        error,
        createError
    }
}