import { Box, TextField, Button, Paper, Typography, InputAdornment, alpha, FormControlLabel, Switch } from "@mui/material";
import { DataGrid, GridRenderCellParams, GridCellParams } from "@mui/x-data-grid";
import { clientColums } from "../tables/clientsColumns";
import { useClients } from "../hooks/clientManagementHooks";

import { IClientUserFormValues } from "../models/client";
import Actions from "../../../components/datagrid/Actions";

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import React from 'react';

interface ClientsDataGridProps {
    onClientSelect?: (clientId: number) => void;
    onAddClient?: () => void;
    onEditClient?: (clientId: number, clientData: IClientUserFormValues) => void;
    onDeleteClient?: (clientId: number) => void;
}

export function ClientsDataGrid({ 
    onClientSelect, 
    onAddClient, 
    onEditClient, 
    onDeleteClient 
}: ClientsDataGridProps) {
    const { clients, displayClients, setDisplayClients, isLoadingClients } = useClients();
    const gradients = useGradients();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [showOnlyActive, setShowOnlyActive] = React.useState(true);
    const [searchValue, setSearchValue] = React.useState("");

    const handleCreateBtnClick = () => {
        if (onAddClient) {
            onAddClient();
        }
    }

    const handleDeleteBtnClick = (params: GridRenderCellParams) => {
        if (onDeleteClient) {
            onDeleteClient(Number(params.id));
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        applyFilters(e.target.value, showOnlyActive);
    }

    const handleActiveFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowOnlyActive(event.target.checked);
        applyFilters(searchValue, event.target.checked);
    }

    const applyFilters = (search: string, onlyActive: boolean) => {
        let filteredClients = clients;

        // Фильтр по активности
        if (onlyActive) {
            filteredClients = filteredClients.filter(client => client.is_active === true);
        }

        // Фильтр по поиску
        if (search !== "") {
            filteredClients = filteredClients.filter((client) =>
                [client.first_name, client.last_name, client.email]
                    .some(field => field?.toLowerCase().startsWith(search.toLowerCase()))
            );
        }

        setDisplayClients(filteredClients);
    }

    // Применяем фильтры при изменении списка клиентов
    React.useEffect(() => {
        applyFilters(searchValue, showOnlyActive);
    }, [clients]);

    const handleEditBtnClick = (params: { id: number | string; row: IClientUserFormValues }) => {
        if (onEditClient) {
            onEditClient(Number(params.id), params.row);
        }
    }

    const handleCellClick = (params: GridCellParams) => {
        if (params.field === 'id' && onClientSelect) {
            onClientSelect(Number(params.id));
        }
    };

    const extendedClientColumns = [...clientColums];

    extendedClientColumns.push({
        field: "actions",
        headerName: "Действия",
        sortable: false,
        renderCell: (params) => (
            <Actions
                params={params}
                handleEdit={() => { handleEditBtnClick({ id: params.id, row: params.row }) }}
                handleDelete={() => handleDeleteBtnClick(params)}
            />)
    });

    return (
        <Box sx={{ width: '100%' }}>
            {/* Фильтры и поиск в отдельной карточке */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: gradients.primary,
                    color: 'white',
                    mb: 3,
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    flexWrap: 'wrap',
                    boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.25)' : '0 2px 8px 0 rgba(80,0,120,0.08)',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mr: 2 }}>
                    Клиенты
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyActive}
                            onChange={handleActiveFilterChange}
                            sx={{
                                '& .MuiSwitch-switchBase': {
                                    color: 'white',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: theme.palette.success.light,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: theme.palette.success.light,
                                    opacity: 1,
                                },
                                '& .MuiSwitch-track': {
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    opacity: 1,
                                },
                            }}
                        />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 4px rgba(80,0,120,0.25)' }}>Только активные</Typography>}
                    sx={{ mr: 2 }}
                />
                <TextField
                    id="filled-search"
                    placeholder="Поиск клиента..."
                    type="search"
                    variant="outlined"
                    onChange={handleSearchChange}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'white' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2,
                            background: alpha('#fff', 0.12),
                            color: 'white',
                            '& .MuiInputBase-input': { color: 'white' },
                        }
                    }}
                    sx={{ minWidth: 280, maxWidth: 340, input: { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                        '& .MuiInputAdornment-root svg': { color: 'white' },
                    }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateBtnClick}
                    sx={{
                        background: 'white',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        boxShadow: 'none',
                        borderRadius: 2,
                        '&:hover': {
                            background: alpha('#ffffff', isDark ? 0.7 : 0.9),
                        }
                    }}
                >
                    Добавить клиента
                </Button>
            </Paper>

            {/* Таблица без внешнего Paper и заголовка */}
            <Box sx={{ width: '100%', p: 0 }}>
                <DataGrid
                    rows={displayClients || []}
                    loading={isLoadingClients}
                    columns={extendedClientColumns}
                    pageSizeOptions={[10]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    disableRowSelectionOnClick
                    sx={{
                        borderRadius: 3,
                        background: isDark ? alpha(theme.palette.background.paper, 0.85) : 'white',
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                        boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(80,0,120,0.06)',
                        '& .MuiDataGrid-columnHeaders': {
                            background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: theme.palette.primary.main,
                        },
                        '& .MuiDataGrid-row': {
                            transition: 'background 0.2s',
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            background: 'transparent',
                        },
                        '& .MuiDataGrid-selectedRowCount': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-actionsCell': {
                            display: 'flex',
                            gap: 1,
                        },
                    }}
                    onCellClick={handleCellClick}
                />
            </Box>
        </Box>
    );
} 