import {GridColDef} from "@mui/x-data-grid";

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


export const trainingTypeColumns: GridColDef[] = [
    {field: 'title', headerName: 'Название', flex: 1},
    {field: 'price', headerName: 'Стоимость', width: 100, valueFormatter: priceFormatter},
    {field: 'require_subscription', headerName: 'Требуется подписка', type: 'boolean', flex: 1},
    {field: 'created_at', headerName: 'Создан', width: 80, valueFormatter: dateFormater},
    {field: 'updated_at', headerName: 'Обновлен', width: 80, valueFormatter: dateFormater},
];