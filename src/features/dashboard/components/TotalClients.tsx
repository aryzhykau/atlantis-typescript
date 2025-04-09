import { Box, Typography } from "@mui/material";
import { useClients } from "../../clients/hooks/clientManagementHooks"


const TotalClients = ()=> {
    const {clients} = useClients();

    const headerStyle = {
        color: theme => theme.palette.text.secondary,
    }
    return <Box 
                display={"flex"} 
                flexDirection={"column"} 
                alignItems={"center"} 
                sx = {{backgroundColor: theme => theme.palette.background.paper}}
                borderRadius={2}
                width={"150px"}
                height={"150px"}
                p={"16px"}
            >
        <Typography sx={headerStyle} variant={"body2"}>Всего</Typography><Typography sx={headerStyle} variant={"body2"}>Клиентов</Typography>
        <Typography variant={"h1"}>{clients.length}</Typography>
    </Box>
};

export default TotalClients;