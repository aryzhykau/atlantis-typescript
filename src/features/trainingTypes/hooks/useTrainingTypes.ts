import {
    useGetTrainingTypesQuery,
    useCreateTrainingTypeMutation,
    useUpdateTrainingTypeMutation
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

    const {data: trainingTypes = [], isLoading, isError, isSuccess, error, refetch: refetchTrainingTypes} = useGetTrainingTypesQuery({});
    const [updateTrainingType, {isLoading: isUpdateLoading, isError: isUpdateError, isSuccess: isUpdateSuccess, error: updateError, data: updateData}] = useUpdateTrainingTypeMutation();

    return {
        createTrainingType,
        
        updateTrainingType,
        trainingTypes,
        updateData,   
        refetchTrainingTypes,
        isCreateSuccess,
        isCreateError,
        isCreateLoading,
        isLoading,
        createdTrainingType,
        isSuccess,
        isError,
        isUpdateError,
        isUpdateLoading,
        isUpdateSuccess,
        updateError,
        error,
        createError
    }
}