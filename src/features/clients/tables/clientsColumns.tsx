import {GridColDef} from "@mui/x-data-grid";
import ClientBalanceCell from "../components/ClientBalanceCell.tsx";
import {Box, Link, Tooltip} from "@mui/material";
import dayjs from "dayjs";
const fieldWidth = 150;



const dateFormater = ( value: string | null ) => {

    if (value === undefined || value === null || value === "") {
        return "Не указана";
    }

    try {
        const date = dayjs(value);
        
        if (!date.isValid()) {
            return "Неверная дата";
        }

        return date.format("DD.MM.YYYY");
    } catch (error) {
        return "Неверная дата";
    }
}



export const clientColums: GridColDef[] = [
    {
        field: "id",
        headerName: "ID",
        width: 100,
        sortable: false,
        renderCell: (params) => (
            <Tooltip title="Нажмите для просмотра клиента">
                <Link
                    component="span"
                    sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        fontWeight: 'medium',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    }}
                >
                    {params.value}
                </Link>
            </Tooltip>
        )
     },
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
        width: 100,
        sortable: false,
    },
    {
        field: "date_of_birth",
        headerName: "Дата рождения",
        width: 100,
        sortable: false,
        valueFormatter: dateFormater
    },
    {
        field: "balance",
        headerName: "Баланс",
        width: 70,
        display: "flex",
        align: "center",
        renderCell: (params) => <ClientBalanceCell balance={params.row.balance}/>
    },
    {
        field: "unpaid_sum",
        headerName: "Задолженность",
        width: 100,
        sortable: false,
        renderCell: (params) => <Box
            sx={{color: theme => params.row.unpaid_sum > 0 ? theme.palette.error.main : theme.palette.text.primary}}
        >
            {params.row.unpaid_sum}€
        </Box>
    },
    {
        field: "unpaid_count",
        headerName: "Неоплаченых инвойсов",
        width: 100,
        sortable: false,
        renderCell: (params) => <Box
            sx={{color: theme => params.row.unpaid_count > 0 ? theme.palette.error.main : theme.palette.text.primary}}
        >{params.row.unpaid_count}</Box>
    },
    {
        field: "whatsapp",
        headerName: "Номер whatsapp",
        width: fieldWidth,
        sortable: false,
    },
    {
        field: "created_at",
        headerName: "Добавлен",
        width: 100,
        sortable: true,
        valueFormatter: dateFormater,
    }


]