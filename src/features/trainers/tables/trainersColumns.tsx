import {GridColDef} from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import dayjs from "dayjs";
const fieldWidth = 150;

export const trainerColums: GridColDef[] = [
    {
        field: "first_name",
        headerName: "Имя",
        headerAlign: "center",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "last_name",
        headerName: "Фамилия",
        width: fieldWidth,
        sortable: true,
        headerAlign: "center",
    },
    {
        field: "email",
        headerName: "E-mail",
        headerAlign: "center",
        width: fieldWidth,
        sortable: true,
    },
    {
        field: "date_of_birth",
        headerName: "Дата рождения",
        width: fieldWidth,
        sortable: true,
        valueFormatter: (value) => {
            return value ? dayjs(value).format("DD.MM.YYYY") : "Нет данных";
        }
    },
    {
        field: "phone",
        headerName: "Телефон",
        width: fieldWidth,
        sortable: false,
        align: "center",
        headerAlign: "center",
        valueGetter: (_value, row) => `${row.phone_country_code} ${row.phone_number}`,
    },
    {
        field: "salary",
        headerName: "Зарплата",
        width: fieldWidth,
        align: "center",
        headerAlign: "center",

        valueGetter: (value) => (value ? `${value}€` : "Нет данных"),

        sortable: true,
    },
    {
        field: "is_fixed_salary",
        headerName: "Фиксированная зарплата",
        align: 'center',
        display: "flex",
        headerAlign: "center",

        sortable: true,
        renderCell: (params) => (
            params.row.fixed_salary ? <CheckCircleIcon color="success"/> : <RemoveCircleIcon color="error"/>
        )
    },
    {
        field: "created_at",
        headerName: "Добавлен",
        width: fieldWidth,
        headerAlign: "center",
        align: "center",
        sortable: true,
        valueFormatter: ( value ) => {

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
    },
]