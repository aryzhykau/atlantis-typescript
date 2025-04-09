import {
    useGetClientsQuery,
    useCreateClientMutation, useUpdateClientMutation, useDeleteClientMutation, useAddClientSubscriptionMutation,
} from '../../../store/apis/clientsApi.ts';
import {IClientGet} from '../models/client.ts';
import {useEffect, useState} from "react";

export const useClients = () => {
    // Получение списка клиентов
    const {
        data: clients = [],
        isLoading: isLoadingClients,
        isError: isErrorClients,
        error: clientsError,
        refetch: refetchClients,
    } = useGetClientsQuery();
    const [displayClients, setDisplayClients] = useState<IClientGet[]>([]);

    useEffect(() => {setDisplayClients(clients)}, [clients])
    // Мутация создания клиента
    const [createClient, {
        isLoading: isCreatingClient,
        isError: isCreateError,
        error: createClientError,
        isSuccess: isCreateSuccess
    }] = useCreateClientMutation();


    const [addClientSubscription, {
        isLoading: isAddSubscriptionLoading,
        isSuccess: isAddSubscriptionSuccess,
        isError: isAddSubscriptionError,
        data: addClientSubscriptionData,
        error: addClientSubscriptionError,
    }] = useAddClientSubscriptionMutation()
    //Client update mutation
    const [updateClient, {
        isLoading: isUpdatingClient,
        isError: isUpdateError,
        error: clientUpdateError,
        isSuccess: isUpdateSuccess
    }] = useUpdateClientMutation();

    const [deleteClient, {isLoading: isDeletingClient, isError: isDeleteError, error: deleteClientError, isSuccess: isDeleteSuccess}] = useDeleteClientMutation();


    // Функция-обертка для удаления клиента
    // const removeClient = async (clientId: number) => {
    //   try {
    //     await deleteClient({ clientId, token }).unwrap();
    //   } catch (error) {
    //     console.error('Ошибка при удалении клиента:', error);
    //     throw error;
    //   }
    // };

    return {
        // Данные клиентов
        clients,
        addClientSubscriptionData,
        displayClients,
        setDisplayClients,


        // Методы работы с клиентами
        createClient,
        updateClient,
        deleteClient,
        addClientSubscription,
        refetchClients,

        // Состояния загрузки для клиентов
        isLoadingClients,
        isAddSubscriptionLoading,
        isCreatingClient,
        isUpdatingClient,
        isDeletingClient,

        // Состояния ошибки
        isErrorClients,
        isAddSubscriptionError,
        isCreateError,
        isUpdateError,
        isDeleteError,

        //Успешные состояния
        isCreateSuccess,
        isAddSubscriptionSuccess,
        isUpdateSuccess,
        isDeleteSuccess,

        //Сами ошибки
        clientsError,
        addClientSubscriptionError,
        clientUpdateError,
        createClientError,
        deleteClientError
    };
};