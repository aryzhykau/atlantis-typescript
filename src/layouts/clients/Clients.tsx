import { Box, Dialog, DialogContent } from "@mui/material";
import { ClientsDataGrid } from "../../features/clients/components/ClientsDataGrid";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ClientsForm } from "../../features/clients/components/ClientsForm";
import { ClientDeleteModal } from "../../features/clients/components/ClientDeleteModal";
import { useClients } from "../../features/clients/hooks/clientManagementHooks";
import { useSnackbar } from "../../hooks/useSnackBar";
import { IClientUserFormValues } from "../../features/clients/models/client";
import { FormikDialog } from "../../components/forms/layout";
import dayjs from "dayjs";


export function ClientsLayout() {
    const navigate = useNavigate();
    const { deleteClient, refetchClients } = useClients();
    const { displaySnackbar } = useSnackbar();

    // Состояние модального окна
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [formTitle, setFormTitle] = useState<string>("Добавить клиента");
    const [isClientEdit, setIsClientEdit] = useState<boolean>(false);
    const [formInitValues, setFormInitValues] = useState<IClientUserFormValues | undefined>(undefined);
    const [clientId, setClientId] = useState<number | null>(null);
    const [isDeletingModal, setIsDeletingModal] = useState<boolean>(false);

    // Обработчики событий для DataGrid
    const handleClientSelect = (clientId: number) => {
        navigate(`/home/clients/${clientId}`);
    };

    const handleAddClient = () => {
        setIsDeletingModal(false);
        setFormTitle("Добавить клиента");
        setIsClientEdit(false);
        setModalOpen(true);
        setFormInitValues(undefined);
    };

    const handleEditClient = (clientId: number, clientData: IClientUserFormValues) => {
        setIsDeletingModal(false);
        setFormTitle("Изменение клиента");
        setClientId(clientId);
        setIsClientEdit(true);
        setModalOpen(true);
        setFormInitValues({
            ...clientData,
            date_of_birth: clientData.date_of_birth ? dayjs(clientData.date_of_birth) : null
        });
    };

    const handleDeleteClient = (clientId: number) => {
        setIsDeletingModal(true);
        setModalOpen(true);
        setClientId(clientId);
    };

    // Обработчики модальных окон
    const handleDeleteConfirm = async () => {
        try {
            if (clientId === null) throw new Error();
            await deleteClient({ clientId }).unwrap();
            displaySnackbar("Клиент удален", "success");
            refetchClients();
            setModalOpen(false);
            setIsDeletingModal(false);
            setClientId(null);
        } catch (e) {
            console.log(e);
            displaySnackbar("Ошибка при удалении клиента", "error");
        }
    };

    const handleDeleteCancel = () => {
        setModalOpen(false);
        setIsDeletingModal(false);
        setClientId(null);
    };

    const handleModalClose = () => setModalOpen(false);

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <ClientsDataGrid 
                onClientSelect={handleClientSelect}
                onAddClient={handleAddClient}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
            />

           
            {!isDeletingModal ? (
                <FormikDialog
                    open={modalOpen}
                    onClose={handleModalClose}
                    title={isClientEdit ? '✏️ Редактировать клиента' : '👤 Добавить нового клиента'}
                    maxWidth="md"
                >
                    <ClientsForm 
                        onClose={handleModalClose} 
                        isEdit={isClientEdit} 
                        title={formTitle} 
                        initialValues={formInitValues} 
                        clientId={clientId}
                    />
                </FormikDialog>
            ) : (
                <Dialog 
                    open={modalOpen} 
                    onClose={handleModalClose} 
                    maxWidth="sm"
                >
                    <DialogContent>
                        <ClientDeleteModal 
                            onConfirm={handleDeleteConfirm} 
                            onCancel={handleDeleteCancel}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
}