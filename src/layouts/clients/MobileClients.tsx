import { useState } from 'react';
import { Box, Typography, Fab, Dialog, DialogContent, DialogTitle, IconButton, CircularProgress } from '@mui/material';
import { useGetClientsQuery } from '../../store/apis/clientsApi';
import { IClientUserGet, IClientUserFormValues } from '../../features/clients/models/client';
import { ClientMobileCard } from '../../features/clients/components/ClientMobileCard';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { ClientsForm } from '../../features/clients/components/ClientsForm';
import dayjs from 'dayjs';


export function MobileClients() {
    const { data: clients, isLoading, isError } = useGetClientsQuery();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<IClientUserGet | null>(null);

    const handleOpenEditModal = (id: number) => {
        const client = clients?.find(c => c.id === id);
        if (client) {
            setClientToEdit(client);
            setOpenEditModal(true);
        }
    };

    const handleCloseModal = () => {
        setOpenEditModal(false);
        setClientToEdit(null);
    }

    const initialFormValues: IClientUserFormValues | undefined = clientToEdit ? {
        first_name: clientToEdit.first_name,
        last_name: clientToEdit.last_name,
        email: clientToEdit.email,
        phone: `${clientToEdit.phone_country_code}${clientToEdit.phone_number}`,
        date_of_birth: clientToEdit.date_of_birth ? dayjs(clientToEdit.date_of_birth) : null,
        whatsapp_number: clientToEdit.whatsapp_country_code && clientToEdit.whatsapp_number ? `${clientToEdit.whatsapp_country_code}${clientToEdit.whatsapp_number}`: '',
        is_student: clientToEdit.students ? clientToEdit.students.length === 0 : false,
        students: clientToEdit.students?.map(s => ({
            first_name: s.first_name,
            last_name: s.last_name,
            date_of_birth: s.date_of_birth ? dayjs(s.date_of_birth) : null,
        })) || []
    } : undefined;


    return (
        <Box sx={{ pb: 7 }}>
            {isLoading && <CircularProgress />}
            {isError && <Typography color="error">Ошибка загрузки клиентов.</Typography>}
            {clients?.map((client: IClientUserGet) => (
                <ClientMobileCard 
                    key={client.id} 
                    client={client} 
                    onEdit={() => handleOpenEditModal(client.id)} 
                    onDelete={() => {}} 
                    onToggleActive={() => {}}
                />
            ))}

            <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} component={Link} to="/home/clients/new">
                <AddIcon />
            </Fab>

            <Dialog open={openEditModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>
                    Редактировать клиента
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {initialFormValues && clientToEdit && (
                        <ClientsForm
                            initialValues={initialFormValues}
                            isEdit={true}
                            clientId={clientToEdit.id}
                            onClose={handleCloseModal}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}