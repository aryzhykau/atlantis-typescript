import React from "react";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IStudent } from "../../../students/models/student.ts";
import { ISubscriptionResponse } from "../../../subscriptions/models/subscription.ts";
import dayjs from "dayjs";

interface StudentsDataCardProps {
    students: IStudent[] | undefined;
    allSubscriptions: ISubscriptionResponse[] | undefined;
    isLoading: boolean;
}

export const StudentsDataCard: React.FC<StudentsDataCardProps> = ({ 
    students, 
    allSubscriptions,
    isLoading
}) => {
    const studentColumns: GridColDef<IStudent>[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'first_name', headerName: 'Имя', width: 130 },
        { field: 'last_name', headerName: 'Фамилия', width: 130 },
        { 
            field: 'date_of_birth', 
            headerName: 'Дата рождения', 
            width: 150,
            valueFormatter: (params: { value: string }) => {
                if (!params.value) return "Не указана";
                return dayjs(params.value).format('DD.MM.YYYY');
            }
        },
        { 
            field: 'is_active', 
            headerName: 'Статус', 
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.row.is_active ? "Активен" : "Неактивен"}
                    color={params.row.is_active ? "success" : "error"}
                    size="small"
                />
            )
        },
        { 
            field: 'active_subscription_id',
            headerName: 'Активный абонемент',
            width: 200,
            renderCell: (params) => {
                if (params.row.active_subscription_id && allSubscriptions) {
                    const activeSubscriptionDetails = allSubscriptions.find(
                        (sub) => sub.id === params.row.active_subscription_id
                    );
                    return activeSubscriptionDetails ? (
                        <Typography variant="body2">
                            {activeSubscriptionDetails.name || "Без названия"}
                        </Typography>
                    ) : (
                        <Chip label="Не найден" variant="outlined" size="small" color="warning" />
                    );
                }
                return <Chip label="Нет" variant="outlined" size="small" />;
            }
        }
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: '100%' }}>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                        <CircularProgress />
                    </Box>
                ) : students && students.length > 0 ? (
                    <DataGrid<IStudent>
                        rows={students}
                        columns={studentColumns}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        autoHeight
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: (theme) => theme.palette.background.paper,
                            },
                        }}
                    />
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                        <Typography color="text.secondary">У клиента нет студентов</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}; 