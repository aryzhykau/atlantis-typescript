import {Box, List, ListItem, CircularProgress, Typography} from "@mui/material";

import { useClients } from "../../features/clients/hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../hooks/useSnackBar.tsx";
import TextField from '@mui/material/TextField';
import {ClientMobileCard} from "../../features/clients/components/ClientMobileCard.tsx";
import {IClientGet} from "../../features/clients/models/client.ts";


export function MobileClientsLayout() {

    const {clients, displayClients, setDisplayClients, isLoadingClients, refetchClients, updateClient} = useClients();
    // const [modalOpen, setModalOpen] = useState<boolean>(false);
    const {displaySnackbar} = useSnackbar();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setDisplayClients(clients);
        }
        else {
            setDisplayClients(clients.filter((client) =>
                [client.first_name, client.last_name, client.email]
                    .some(field => field?.toLowerCase().startsWith(e.target.value.toLowerCase()))
            ));
        }
    }

    const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>,
                                      client: IClientGet) => {
        const isActive = event.target.checked;
        try {
            await updateClient({
                clientId: client.id,
                clientData: {
                    first_name: client.first_name,
                    last_name: client.last_name,
                    active: isActive,
                    email: client.email,
                    phone: client.phone,
                    is_birthday: client.is_birthday,
                    birth_date: client.birth_date,
                    parent_name: client.parent_name,
                    whatsapp: client.whatsapp,
                    role: client.role,
                }
            }).unwrap();
            displaySnackbar(
                `Клиент ${client.first_name} ${client.last_name} ${isActive ? "теперь активен и может посещать тренировки" : "приостановлен и не сможет посещать тренировки"}`,
                "success"
            );
            await refetchClients();
        } catch (error) {
            console.error(error);
            displaySnackbar(
                "Ошибка при изменении состояния активности клиента",
                "error"
            );
        }
    }

    return (
        <>
        <Box sx={{mt: "16px", p: 2, display: "flex",  height: "90vh", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "16px"}}>
            <Box display="flex" justifyContent="space-between" mb="32px" width="100%" sx={{alignItems: "center"}}>
                <Typography variant="h4">Клиенты</Typography>
                <TextField
                    id="filled-search"
                    label="Поиск клиента"
                    type="search"
                    variant="outlined"
                    onChange={handleSearchChange}
                ></TextField>

            </Box>
            <Box sx={{overflowY: "auto", flexGrow: 1, width: "100%"}}>
                {!isLoadingClients ? (<List>
                    {displayClients.map((client) => (
                        <ListItem>
                            <ClientMobileCard onEdit={() => console.log("Edit")} onDelete={() => console.log("Delete")} client={client} onToggleActive={handleChangeActive} />
                        </ListItem>
                    ))}
                </List>) : (<Box display="flex" justifyContent="center" alignItems="center" height="80%"><CircularProgress /></Box>)}
            </Box>
        </Box>
        </>
    )
}