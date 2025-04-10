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
};


const priceFormatter = (value: never) => {
    if (value === undefined || value === null) {
        return "Не указана цена"
    }
    return `${value}€`
};




export const invoicesColumns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 80},
    {field: 'invoice_type', headerName: 'Тип', flex: 1},
    {field: 'amount', headerName: 'Сумма', flex: 1, valueFormatter: priceFormatter},
    {field: 'created_at', headerName: 'Создан', flex: 1, valueFormatter: dateFormater},
    {field: 'paid_at', headerName: 'Оплачено', width: 100, valueFormatter: dateFormater},
    {field: 'client_subscription_id', headerName: 'Идентификатор подписки', flex: 1},
];