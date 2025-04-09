import {
    useGetSubscriptionsQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useDeleteSubscriptionMutation
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

    const {data: subscriptions = [], isLoading, isError, isSuccess, error, refetch: refetchSubscriptions} = useGetSubscriptionsQuery();

    const [updateSubscription, {data: updatedSubscription, isLoading: isUpdateLoading, isError: isUpdateError, error: updateError}] = useUpdateSubscriptionMutation();
    const [deleteSubscription, {isLoading: isDeleteLoading, isError: isDeleteError, isSuccess: isDeleteSuccess, data: deleteData, error: deleteError}] = useDeleteSubscriptionMutation();
    return {
        createSubscription,
        deleteSubscription,
        deleteData,
        deleteError,
        isDeleteLoading,
        isDeleteError,
        isDeleteSuccess,
        updatedSubscription,
        updateSubscription,
        subscriptions,
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