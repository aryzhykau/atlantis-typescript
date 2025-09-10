import {GridColDef} from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import dayjs from "dayjs";
import { UserRole } from "../models/trainer";

const fieldWidth = 150;

// Base columns that are shown to all roles
const baseColumns: GridColDef[] = [
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
];

// Salary columns that are only shown to owners
const salaryColumns: GridColDef[] = [
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
            params.row.is_fixed_salary ? <CheckCircleIcon color="success"/> : <RemoveCircleIcon color="error"/>
        )
    },
];

// Function to get columns based on user role
export const getTrainerColumns = (userRole?: string): GridColDef[] => {
    const columns = [...baseColumns];
    
    // Only owners can see salary information
    if (userRole === UserRole.OWNER) {
        // Insert salary columns after phone column (index 4)
        columns.splice(5, 0, ...salaryColumns);
    }
    
    return columns;
};

// Legacy export for backward compatibility
export const trainerColums = baseColumns;