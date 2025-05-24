import {GridColDef, GridRenderCellParams} from "@mui/x-data-grid";
import SubscriptionActiveCell from "../components/SubscriptionActiveCell.tsx";
import { ISubscriptionResponse } from "../models/subscription.ts";
import { Chip } from "@mui/material";
import { ITrainingType } from "../../trainingTypes/models/trainingType.ts";

const priceFormatter = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
        return "-";
    }
    return `${price.toLocaleString('ru-RU')} €`;
}

const durationFormatter = (validityDays: number | undefined | null) => {
    if (validityDays === undefined || validityDays === null || isNaN(validityDays)) {
        return "-";
    }
    return `${validityDays} дн.`;
}

const sessionsFormatter = (sessions: number | undefined | null) => {
    if (sessions === undefined || sessions === null || isNaN(sessions)) {
        return "-";
    }
    return sessions.toString();
}


export const subscriptionsColumns: GridColDef[] = [
    {field: 'name', headerName: 'Название', flex: 1.5, minWidth: 150},
    {
        field: 'number_of_sessions',
        headerName: 'Занятий',
        flex: 0.8,
        minWidth: 80,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value: number) => sessionsFormatter(value)
    },
    {
        field: 'validity_days',
        headerName: 'Действует (дней)',
        flex: 1,
        minWidth: 100,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value: number) => durationFormatter(value)
    },
    {
        field: 'price',
        headerName: 'Стоимость',
        flex: 1,
        minWidth: 100,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value: number) => priceFormatter(value)
    },
    {
        field: 'is_active',
        headerName: 'Статус',
        flex: 0.7,
        minWidth: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
            <Chip
                label={params.value ? "Активен" : "Неактивен"}
                color={params.value ? "success" : "default"}
                size="small"
                variant={params.value ? "filled" : "outlined"}
                sx={{ mr: 1 }}
            />
        
    ),
    },
];