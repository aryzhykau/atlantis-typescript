import {GridColDef} from "@mui/x-data-grid";
import SubscriptionsCell from "../components/SubscriptionsCell.tsx";
const fieldWidth = 150;



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

export const clientColums: GridColDef[] = [
    {
        field: "first_name",
        headerName: "Имя",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "last_name",
        headerName: "Фамилия",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "email",
        headerName: "E-mail",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "phone",
        headerName: "Телефон",
        width: fieldWidth,
        sortable: false,
    },
    {
        field: "birth_date",
        headerName: "Дата рождения",
        width: fieldWidth,
        sortable: false,
        valueFormatter: dateFormater
    },
    {
        field: "subscriptions",
        headerName: "Абонемент",
        width:280,
        display: "flex",
        sortable: false,
        renderCell: (params) => <SubscriptionsCell params={params}></SubscriptionsCell>
    },

    {
        field: "created_at",
        headerName: "Добавлен",
        width: fieldWidth,
        sortable: true,
        valueFormatter: dateFormater,
    },
    {
        field: "parent_name",
        headerName: "Имя родителя",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "whatsapp",
        headerName: "Номер whatsapp",
        width: fieldWidth,
        sortable: false,
    },


]