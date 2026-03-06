import { Box, Dialog, DialogContent } from "@mui/material";
import { UnifiedClientsDataGrid } from "../../features/clients/components/UnifiedClientsDataGrid";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ClientsForm } from "../../features/clients/components/ClientsForm";
import { ClientDeleteModal } from "../../features/clients/components/ClientDeleteModal";
import { useClients } from "../../features/clients/hooks/clientManagementHooks";
import { useSnackbar } from "../../hooks/useSnackBar";
import { IClientUserFormValues } from "../../features/clients/models/client";
import { FormikDialog } from "../../components/forms/layout";


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

    // Note: Edit and delete functionality moved to row-level interactions
    // These handlers can be re-implemented when needed for specific workflows

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
        <Box sx={{ display: "flex", flexDirection: "column", height: '100%' }}>
            <UnifiedClientsDataGrid 
                onClientSelect={handleClientSelect}
                onAddClient={handleAddClient}
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