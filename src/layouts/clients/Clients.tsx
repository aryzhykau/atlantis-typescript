import { Box, Dialog, DialogContent, Modal, Typography, IconButton, alpha } from "@mui/material";
import { ClientsDataGrid } from "../../features/clients/components/ClientsDataGrid";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ClientsForm } from "../../features/clients/components/ClientsForm";
import { ClientDeleteModal } from "../../features/clients/components/ClientDeleteModal";
import { useClients } from "../../features/clients/hooks/clientManagementHooks";
import { useSnackbar } from "../../hooks/useSnackBar";
import { IClientUserFormValues } from "../../features/clients/models/client";
import { useGradients } from "../../features/trainer-mobile/hooks/useGradients";
import { useTheme } from "@mui/material";
import dayjs from "dayjs";

const style = {
    position: "absolute",
    width: "50%",
    top: "50%",
    height: "90%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    p: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
};

export function ClientsLayout() {
    const navigate = useNavigate();
    const { deleteClient, refetchClients } = useClients();
    const { displaySnackbar } = useSnackbar();
    const gradients = useGradients();
    const theme = useTheme();

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

           
            <Dialog 
                open={modalOpen} 
                onClose={handleModalClose} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ 
                    sx: { 
                        m: 1, 
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                    } 
                }}
            >
                {!isDeletingModal ? (
                    <>
                        {/* Градиентный заголовок модального окна */}
                        <Box
                            sx={{
                                p: 3,
                                background: gradients.primary,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                    opacity: theme.palette.mode === 'dark' ? 0.18 : 0.3,
                                }
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                    {isClientEdit ? '✏️ Редактировать клиента' : '👤 Добавить нового клиента'}
                                </Typography>
                                <IconButton
                                    aria-label="Закрыть"
                                    onClick={handleModalClose}
                                    sx={{
                                        color: 'white',
                                        ml: 2,
                                        '&:hover': {
                                            background: alpha('#ffffff', 0.15),
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                </IconButton>
                            </Box>
                        </Box>
                        
                        {/* Контент модального окна */}
                        <DialogContent sx={{ p: 3, '&:first-of-type': { pt: 0 } }}>
                            <ClientsForm 
                                onClose={handleModalClose} 
                                isEdit={isClientEdit} 
                                title={formTitle} 
                                initialValues={formInitValues} 
                                clientId={clientId}
                            />
                        </DialogContent>
                    </>
                ) : (
                    <ClientDeleteModal 
                        onConfirm={handleDeleteConfirm} 
                        onCancel={handleDeleteCancel}
                    />
                )}
            </Dialog>
        </Box>
    );
}