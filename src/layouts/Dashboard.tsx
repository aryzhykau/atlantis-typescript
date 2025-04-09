import {Box} from "@mui/material";
import dayjs from "dayjs";
import {useClients} from "../features/clients/hooks/clientManagementHooks.ts";
import CountedPanel from "../features/dashboard/components/CountedPanel.tsx";
import {useState} from "react";

export function DashboardLayout() {
    const {clients} = useClients();
    const [newClients, setNewClients] = useState(clients.filter((client) => dayjs(client.created_at) >= dayjs().startOf("month")));
    return (
    <Box display={"flex"} justifyContent={"flex-start"} gap={"10px"} alignItems={"flex-start"}>
        <CountedPanel data={clients.length} headerLines={["Всего", "Клиентов"]}></CountedPanel>
        <CountedPanel data={newClients.length} headerLines={["Новых", "Клиентов"]}></CountedPanel>
    </Box>
    );
}