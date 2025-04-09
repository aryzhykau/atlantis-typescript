import {Card, Box, Typography} from "@mui/material";
import TotalClients from "../features/dashboard/components/TotalClients";
import NewClients from "../features/dashboard/components/NewClients";

export function DashboardLayout() {
    return (
    <>
        <TotalClients/>
        <NewClients></NewClients>
    </>
    );
}