import {GridColDef} from "@mui/x-data-grid";
import TrainingTypeColorCircle from "../components/TrainingTypeColorCircle.tsx";
import { Chip } from "@mui/material";


const priceFormatter = (value: number | null | undefined, params?: any) => {
    if (params?.row?.is_subscription_only) {
        return '—';
    }
    if (value === undefined || value === null) {
        return "Не указана цена";
    }
    return `${value}€`;
}


export const trainingTypeColumns: GridColDef[] = [
    {field: 'color', headerName: "#", headerAlign: "center", width:30, align: "center", display: "flex", renderCell: params => <TrainingTypeColorCircle circleColor={params.row.color}/>},
    {field: 'name', headerName: 'Название', flex: 1},
    {field: 'price', headerName: 'Стоимость', width: 120, valueFormatter: (_v, p) => priceFormatter(p.value as number | null | undefined, p)},
    {field: 'max_participants', headerName: 'Макс. учеников', width: 100},
    {
        field: 'is_subscription_only',
        headerName: 'Только по подписке',
        type: 'boolean',
        flex: 1,
        renderCell: (params) => (
            <Chip
                label={params.value ? "Да" : "Нет"}
                color={params.value ? "primary" : "default"}
                size="small"
                variant="outlined"
            />
        )
    },
];