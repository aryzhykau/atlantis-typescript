import { Box, Typography } from "@mui/material";
import { useClients } from "../../clients/hooks/clientManagementHooks"
import { useState } from "react";
import { IClientGet } from "../../clients/models/client";
import dayjs from "dayjs";


const NewClients = ()=> {
    const {clients} = useClients();
    const targetDate = dayjs().startOf("month");
    const [newClients, setNewClients] = useState<IClientGet[] | undefined>(clients.filter(
        (client) => dayjs(client.created_at) >= targetDate
    ))
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
        <Typography sx={headerStyle} variant={"body2"}>Новых</Typography><Typography sx={headerStyle} variant={"body2"}>Клиентов</Typography>
        <Typography variant={"h1"}>{newClients?.length}</Typography>
    </Box>
};

export default NewClients;

