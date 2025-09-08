import {GridColDef} from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {IUserBasic} from "../models/invoice.ts";


const dateFormater = ( value: never ) => {

    if (value === undefined || value === null) {
        return "Не указана дата";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) return "Неверная дата"; // Если дата некорректная

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};


const priceFormatter = (value: never) => {
    if (value === undefined || value === null) {
        return "Не указана цена"
    }
    return `${value}€`
};


const typeFormatter = (value: never) => {
    switch (value) {
        case "SUBSCRIPTION":
            return "Оплата подписки"
        case "TRAINING":
            return "Разовая тренировка"
        case "LATE_CANCELLATION_FEE":
            return "Штраф за позднюю отмену"
        default:
            return "Тип неизвестен"
    }
}

const userFormatter = (value : IUserBasic) => {
    return value.first_name + " " + value.last_name;
}




export const invoicesColumns: GridColDef[] = [
    {field: 'created_at', headerName: 'Дата выставления', width: 200, valueFormatter: dateFormater},
    {field: 'paid_at', headerName: 'Оплачено', width: 100,display: "flex", align: "center",headerAlign: "center", renderCell: params =>  params.row.paid_at ? <CheckCircleIcon color={"success"}/> : <RemoveCircleIcon color={"error"}/>},
    {field: 'amount', headerName: 'Сумма', width: 100, valueFormatter: priceFormatter},
    {field: 'client', headerName: 'Клиент', flex: 1, valueFormatter: userFormatter},
    {field: 'type', headerName: 'Тип', flex: 1, valueFormatter: typeFormatter},
];