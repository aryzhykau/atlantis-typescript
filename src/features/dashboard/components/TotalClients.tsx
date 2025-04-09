import { Box, Typography } from "@mui/material";
import { useClients } from "../../clients/hooks/clientManagementHooks"
import { TipsAndUpdates } from "@mui/icons-material";

const TotalClients = ()=> {
    const {clients} = useClients();
    return <Box>
        <Typography variant={"h4"}>Всего клиентов</Typography>
        <Typography variant={"h2"}>{clients.length}</Typography>
    </Box>
};

export default TotalClients;