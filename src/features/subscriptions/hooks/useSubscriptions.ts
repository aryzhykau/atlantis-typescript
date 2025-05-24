import {
    useGetSubscriptionsQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation,
    useAddSubscriptionToStudentMutation
} from "../../../store/apis/subscriptionsApi.ts";


export const useSubscriptions = () => {
    const [
        createSubscription,
        {
            data: createdSubscription,
            isSuccess: isCreateSuccess,
            isError: isCreateError,
            error: createError,
            isLoading: isCreateLoading
        }
    ] = useCreateSubscriptionMutation();

    const {data: subscriptions = {items: [], total: 0}, isLoading, isError, isSuccess, error, refetch: refetchSubscriptions} = useGetSubscriptionsQuery();

    const [updateSubscription, {data: updatedSubscription, isLoading: isUpdateLoading, isError: isUpdateError, error: updateError}] = useUpdateSubscriptionMutation();
    const [deleteSubscription, {isLoading: isDeleteLoading, isError: isDeleteError, isSuccess: isDeleteSuccess, data: deleteData, error: deleteError}] = useDeleteSubscriptionMutation();
    const [addSubscriptionToStudent, {isLoading: isAddSubscriptionToStudentLoading, isError: isAddSubscriptionToStudentError, isSuccess: isAddSubscriptionToStudentSuccess, data: addSubscriptionToStudentData, error: addSubscriptionToStudentError}] = useAddSubscriptionToStudentMutation(); 
    return {
        createSubscription,
        deleteSubscription,
        addSubscriptionToStudent,
        deleteData,
        deleteError,
        addSubscriptionToStudentData,
        addSubscriptionToStudentError,
        isAddSubscriptionToStudentLoading,
        isAddSubscriptionToStudentError,
        isAddSubscriptionToStudentSuccess,
        isDeleteLoading,
        isDeleteError,
        isDeleteSuccess,
        updatedSubscription,
        updateSubscription,
        subscriptions: subscriptions.items,
        total: subscriptions.total,
        refetchSubscriptions,
        isCreateSuccess,
        isCreateError,
        isCreateLoading,
        isLoading,
        isUpdateError,
        isUpdateLoading,
        updateError,
        createdSubscription,
        isSuccess,
        isError,
        error,
        createError
    }
}