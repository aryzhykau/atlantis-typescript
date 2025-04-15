import {Box} from "@mui/material";
import dayjs from "dayjs";
import {useClients} from "../features/clients/hooks/clientManagementHooks.ts";
import CountedPanel from "../features/dashboard/components/CountedPanel.tsx";
import {useState} from "react";
import {useGetTrainingsQuery} from "../store/apis/trainings.ts";
// import * as React from 'react';
// import { LineChart } from '@mui/x-charts/LineChart';
// import useCalendar from "../features/calendar/hooks/useCalendar.ts";



// const getDaysInMonth=(year: number, month: number): number[] => {
//     const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
//     return Array.from({length: daysInMonth}, (_, index) => index + 1);
// };

export function DashboardLayout() {
    const {clients} = useClients();
    const {data: trainings} = useGetTrainingsQuery({},{refetchOnMountOrArgChange: true});
    const [newTrainings,] = useState(trainings ? trainings.filter((training) => dayjs(training.created_at) >= dayjs().startOf("month")) : []);
    const [newClients,] = useState(clients.filter((client) => dayjs(client.created_at) >= dayjs().startOf("month")));

    return (
    <Box display={"flex"} justifyContent={"flex-start"} gap={"10px"} alignItems={"flex-start"}>
        <CountedPanel data={clients.length} headerLines={["Всего", "Клиентов"]}></CountedPanel>
        <CountedPanel data={newClients.length} headerLines={["Новых", "Клиентов"]}></CountedPanel>
        <CountedPanel data={newTrainings.length} headerLines={["Тренировок", "За месяц"]}></CountedPanel>
        <CountedPanel headerLines={["Клиентов с абонементом"]} data={clients.filter((client) => client.active_subscription).length}/>

        

        

    

    </Box>
    );
}