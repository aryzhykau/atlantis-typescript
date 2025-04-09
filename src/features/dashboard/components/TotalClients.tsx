import { Box, Typography } from "@mui/material";
import { useClients } from "../../clients/hooks/clientManagementHooks"


const TotalClients = ()=> {
    const {clients} = useClients();
    return <Box 
                display={"flex"} 
                flexDirection={"column"} 
                alignItems={"center"} 
                bgcolor={"paper"} 
                borderRadius={10}
                width={"150px"}
                height={"150px"}
            >
        <Typography variant={"h4"}>Всего клиентов</Typography>
        <Typography variant={"h2"}>{clients.length}</Typography>
    </Box>
};

export default TotalClients;