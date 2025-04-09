import {GridColDef} from "@mui/x-data-grid";
import SubscriptionActiveCell from "../components/SubscriptionActiveCell.tsx";

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
}


const priceFormatter = (value: never) => {
    if (value === undefined || value === null) {
        return "Не указана цена"
    }
    return `${value}€`
}

const durationFormater = (value: never) => {
    if (value === undefined || value === null) {
        return "Значение отсутсвует"
    }
    return `${value} дней`
}




export const subscriptionsColumns: GridColDef[] = [
    {field: 'title', headerName: 'Название', flex: 1},
    {field: 'total_sessions', headerName: 'Количество тренировок', flex: 1},
    {field: 'duration', headerName: 'Время действия', flex: 1, valueFormatter: durationFormater},
    {field: 'price', headerName: 'Стоимость', width: 100, valueFormatter: priceFormatter},
    {field: 'active', headerName: 'Активна', type: 'boolean', flex: 1, renderCell: params => <SubscriptionActiveCell params={params}/>},
    {field: 'created_at', headerName: 'Создана', width: 80, valueFormatter: dateFormater},
    {field: 'updated_at', headerName: 'Обновлена', width: 80, valueFormatter: dateFormater},
];