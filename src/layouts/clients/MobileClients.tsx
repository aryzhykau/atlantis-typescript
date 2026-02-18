import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Fab,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    FormControlLabel,
    Switch,
    Dialog,
    DialogContent,
    Alert,
    Stack,
} from '@mui/material';
import { useGetClientsQuery, useLazyGetClientStudentsQuery } from '../../store/apis/clientsApi';
import { IClientUserGet, IClientUserFormValues } from '../../features/clients/models/client';
import { ClientMobileCardV2 } from '../../features/clients/components/ClientMobileCardV2';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { ClientsForm } from '../../features/clients/components/ClientsForm';
import { FormikDialog } from '../../components/forms/layout';
import dayjs from 'dayjs';
import { useListClientContactsQuery } from '../../store/apis/clientContactsApi';
import { useUpdateClientStatusMutation } from '../../store/apis/clientsApi';
import { useSnackbar } from '../../hooks/useSnackBar';
import { useGradients } from '../../features/trainer-mobile/hooks/useGradients';
import {
    MetricPillCard,
    MobileCollapsibleSearch,
    MobileFilterBottomSheet,
    MobileFormBottomSheet,
    MobilePageShell,
    MobileRefreshContainer,
    SwipeableActionCard,
} from '../../components/mobile-kit';
import useMobile from '../../hooks/useMobile';


export function MobileClients() {
    const isMobile = useMobile();
    const isBottomSheetFormEnabled = isMobile && import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';
    const navigate = useNavigate();
    const gradients = useGradients();
    const { displaySnackbar } = useSnackbar();
    const { data: clients, isLoading, isError, isFetching, refetch } = useGetClientsQuery();
    const { data: pendingContacts } = useListClientContactsQuery({ status: 'PENDING', limit: 200 });
    const [updateClientStatus] = useUpdateClientStatusMutation();
    const [triggerGetClientStudents] = useLazyGetClientStudentsQuery();

    const [openEditModal, setOpenEditModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<IClientUserGet | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [showOnlyActive, setShowOnlyActive] = useState(true);
    const [showOnlyWithStudents, setShowOnlyWithStudents] = useState(false);
    const [clientToToggleStatus, setClientToToggleStatus] = useState<IClientUserGet | null>(null);
    const [studentCountsByClientId, setStudentCountsByClientId] = useState<Record<number, number>>({});
    const [studentCountsLoadingByClientId, setStudentCountsLoadingByClientId] = useState<Record<number, boolean>>({});
    const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('atlantis_mobile_clients_swipe_tip_seen') !== '1';
    });

    const handleOpenEditModal = (id: number) => {
        const client = clients?.find(c => c.id === id);
        if (client) {
            setClientToEdit(client);
            setOpenEditModal(true);
        }
    };

    const handleCloseModal = () => {
        setOpenEditModal(false);
        setClientToEdit(null);
    }

    const handleOpenCreateModal = () => {
        setClientToEdit(null);
        setOpenEditModal(true);
    };

    const handleClientOpen = (id: number) => {
        navigate(`/home/clients/${id}`);
    };

    const filteredClients = useMemo(() => {
        const base = clients ?? [];

        return base.filter((client) => {
            if (showOnlyActive && !client.is_active) {
                return false;
            }

            const isStudentsCountLoading = studentCountsLoadingByClientId[client.id] || (base.length > 0 && studentCountsByClientId[client.id] === undefined);
            const studentCount = studentCountsByClientId[client.id] ?? client.students?.length ?? 0;
            if (showOnlyWithStudents && !isStudentsCountLoading && !studentCount) {
                return false;
            }

            if (!searchValue.trim()) {
                return true;
            }

            const query = searchValue.toLowerCase().trim();
            const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
            const phone = `${client.phone_country_code}${client.phone_number}`.toLowerCase();

            return (
                fullName.includes(query)
                || phone.includes(query)
                || client.email?.toLowerCase().includes(query)
            );
        });
    }, [clients, showOnlyActive, showOnlyWithStudents, searchValue, studentCountsByClientId, studentCountsLoadingByClientId]);

    useEffect(() => {
        let isMounted = true;

        const loadStudentCounts = async () => {
            if (!clients || clients.length === 0) {
                if (isMounted) {
                    setStudentCountsByClientId({});
                    setStudentCountsLoadingByClientId({});
                }
                return;
            }

            const initialLoadingMap = clients.reduce<Record<number, boolean>>((acc, client) => {
                acc[client.id] = true;
                return acc;
            }, {});

            if (isMounted) {
                setStudentCountsByClientId({});
                setStudentCountsLoadingByClientId(initialLoadingMap);
            }

            const results = await Promise.allSettled(
                clients.map((client) => triggerGetClientStudents(client.id, false).unwrap()),
            );

            if (!isMounted) {
                return;
            }

            const nextCounts: Record<number, number> = {};
            results.forEach((result, idx) => {
                const clientId = clients[idx].id;
                if (result.status === 'fulfilled') {
                    nextCounts[clientId] = result.value.length;
                } else {
                    nextCounts[clientId] = clients[idx].students?.length ?? 0;
                }
            });

            setStudentCountsByClientId(nextCounts);
            setStudentCountsLoadingByClientId({});
        };

        loadStudentCounts();

        return () => {
            isMounted = false;
        };
    }, [clients, triggerGetClientStudents]);

    const stats = useMemo(() => {
        const base = clients ?? [];
        const total = base.length;
        const active = base.filter((client) => client.is_active).length;
        const withStudents = base.filter((client) => {
            const isStudentsCountLoading = studentCountsLoadingByClientId[client.id] || (base.length > 0 && studentCountsByClientId[client.id] === undefined);
            if (isStudentsCountLoading) return false;
            return (studentCountsByClientId[client.id] ?? client.students?.length ?? 0) > 0;
        }).length;
        const pending = pendingContacts?.length ?? 0;
        return { total, active, withStudents, pending };
    }, [clients, pendingContacts, studentCountsByClientId, studentCountsLoadingByClientId]);

    const isStudentsCountLoading = (client: IClientUserGet) => {
        const base = clients ?? [];
        return studentCountsLoadingByClientId[client.id] || (base.length > 0 && studentCountsByClientId[client.id] === undefined);
    };

    const handleConfirmToggleStatus = async () => {
        if (!clientToToggleStatus) return;

        try {
            await updateClientStatus({
                clientId: clientToToggleStatus.id,
                is_active: !clientToToggleStatus.is_active,
            }).unwrap();
            displaySnackbar(
                clientToToggleStatus.is_active ? 'Клиент деактивирован' : 'Клиент активирован',
                'success',
            );
            setClientToToggleStatus(null);
            await refetch();
        } catch {
            displaySnackbar('Ошибка обновления статуса клиента', 'error');
        }
    };

    const handleCloseSwipeTip = () => {
        setShowSwipeTip(false);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('atlantis_mobile_clients_swipe_tip_seen', '1');
        }
    };

    const initialFormValues: IClientUserFormValues | undefined = clientToEdit ? {
        first_name: clientToEdit.first_name,
        last_name: clientToEdit.last_name,
        email: clientToEdit.email,
        phone: `${clientToEdit.phone_country_code}${clientToEdit.phone_number}`,
        date_of_birth: clientToEdit.date_of_birth ? dayjs(clientToEdit.date_of_birth) : null,
        whatsapp_number: clientToEdit.whatsapp_country_code && clientToEdit.whatsapp_number ? `${clientToEdit.whatsapp_country_code}${clientToEdit.whatsapp_number}`: '',
        is_student: clientToEdit.students ? clientToEdit.students.length === 0 : false,
        students: clientToEdit.students?.map(s => ({
            first_name: s.first_name,
            last_name: s.last_name,
            date_of_birth: s.date_of_birth ? dayjs(s.date_of_birth) : null,
        })) || []
    } : undefined;


    return (
        <MobileRefreshContainer
            onRefresh={refetch}
            isRefreshing={isFetching}
            disabled={openEditModal || filtersOpen || Boolean(clientToToggleStatus)}
            showManualRefreshButton={false}
        >
            <MobilePageShell
                title="Клиенты"
                subtitle="Карточки клиентов с быстрыми действиями"
                icon={<GroupIcon />}
                actions={(
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MobileCollapsibleSearch
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Имя, телефон, email"
                            onDarkBackground
                        />
                        <IconButton aria-label="open-filters" onClick={() => setFiltersOpen(true)}>
                            <FilterListIcon sx={{ color: 'white' }} />
                        </IconButton>
                    </Box>
                )}
                stats={(
                    <Grid container spacing={1.25}>
                        <Grid item xs={6}>
                            <MetricPillCard label="Всего" value={stats.total} gradient={gradients.primary} icon={<GroupIcon fontSize="small" />} />
                        </Grid>
                        <Grid item xs={6}>
                            <MetricPillCard label="Активные" value={stats.active} gradient={gradients.success} icon={<CheckCircleIcon fontSize="small" />} />
                        </Grid>
                        <Grid item xs={6}>
                            <MetricPillCard label="С учениками" value={stats.withStudents} gradient={gradients.info} icon={<SchoolIcon fontSize="small" />} />
                        </Grid>
                        <Grid item xs={6}>
                            <MetricPillCard label="Контакты" value={stats.pending} gradient={gradients.warning} icon={<FilterListIcon fontSize="small" />} />
                        </Grid>
                    </Grid>
                )}
                fab={(
                    <Fab
                        aria-label="add-client"
                        sx={{
                            position: 'fixed',
                            right: 16,
                            bottom: 16,
                            background: gradients.primary,
                            color: 'white',
                            '&:hover': {
                                background: gradients.primary,
                                filter: 'brightness(0.95)',
                            },
                        }}
                        onClick={handleOpenCreateModal}
                    >
                        <AddIcon />
                    </Fab>
                )}
            >
                <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Список клиентов
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Найдено: {filteredClients.length}
                        </Typography>
                    </Box>

                    {showSwipeTip && (
                        <Box sx={{ px: 2, pb: 1 }}>
                            <Alert severity="info" onClose={handleCloseSwipeTip} sx={{ borderRadius: 2 }}>
                                Свайп влево по карточке, чтобы открыть действия. Свайп вправо — закрыть.
                            </Alert>
                        </Box>
                    )}

                    {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />}
                    {isError && <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки клиентов.</Typography>}

                    {!isLoading && !isError && filteredClients.length === 0 && (
                        <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
                            Клиенты не найдены. Измените фильтры или добавьте нового клиента.
                        </Typography>
                    )}

                    {filteredClients.map((client: IClientUserGet) => (
                        <SwipeableActionCard
                            key={client.id}
                            revealContent={(
                                <Stack direction="row" sx={{ width: '100%' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleOpenEditModal(client.id)}
                                        sx={{
                                            borderRadius: 0,
                                            background: gradients.primary,
                                            color: 'white',
                                            fontWeight: 700,
                                            '&:hover': {
                                                background: gradients.primary,
                                                filter: 'brightness(0.95)',
                                            },
                                        }}
                                    >
                                        Редакт.
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => setClientToToggleStatus(client)}
                                        sx={{
                                            borderRadius: 0,
                                            background: client.is_active ? gradients.warning : gradients.success,
                                            color: 'white',
                                            fontWeight: 700,
                                            '&:hover': {
                                                background: client.is_active ? gradients.warning : gradients.success,
                                                filter: 'brightness(0.95)',
                                            },
                                        }}
                                    >
                                        {client.is_active ? 'Статус' : 'Актив.'}
                                    </Button>
                                </Stack>
                            )}
                            revealWidth={176}
                        >
                            <ClientMobileCardV2
                                client={client}
                                onOpen={() => handleClientOpen(client.id)}
                                studentsCount={studentCountsByClientId[client.id] ?? client.students?.length ?? 0}
                                isStudentsCountLoading={isStudentsCountLoading(client)}
                            />
                        </SwipeableActionCard>
                    ))}
                </Box>
            </MobilePageShell>

            <MobileFilterBottomSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                onApply={() => setFiltersOpen(false)}
                onReset={() => {
                    setShowOnlyActive(true);
                    setShowOnlyWithStudents(false);
                    setSearchValue('');
                    setFiltersOpen(false);
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={showOnlyActive}
                                onChange={(event) => setShowOnlyActive(event.target.checked)}
                            />
                        )}
                        label="Только активные"
                    />
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={showOnlyWithStudents}
                                onChange={(event) => setShowOnlyWithStudents(event.target.checked)}
                            />
                        )}
                        label="Только с учениками"
                    />
                </Box>
            </MobileFilterBottomSheet>

            {isBottomSheetFormEnabled ? (
                <MobileFormBottomSheet
                    open={openEditModal}
                    onClose={handleCloseModal}
                    title={clientToEdit ? '✏️ Редактировать клиента' : '👤 Добавить нового клиента'}
                >
                    <ClientsForm
                        initialValues={initialFormValues}
                        isEdit={Boolean(clientToEdit)}
                        clientId={clientToEdit?.id ?? null}
                        onClose={handleCloseModal}
                    />
                </MobileFormBottomSheet>
            ) : (
                <FormikDialog
                    open={openEditModal}
                    onClose={handleCloseModal}
                    title={clientToEdit ? '✏️ Редактировать клиента' : '👤 Добавить нового клиента'}
                    maxWidth="sm"
                >
                    <ClientsForm
                        initialValues={initialFormValues}
                        isEdit={Boolean(clientToEdit)}
                        clientId={clientToEdit?.id ?? null}
                        onClose={handleCloseModal}
                    />
                </FormikDialog>
            )}

            <Dialog open={Boolean(clientToToggleStatus)} onClose={() => setClientToToggleStatus(null)} maxWidth="xs" fullWidth>
                <DialogContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                        {clientToToggleStatus?.is_active ? 'Деактивировать клиента?' : 'Активировать клиента?'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {clientToToggleStatus && `${clientToToggleStatus.first_name} ${clientToToggleStatus.last_name}`}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button variant="outlined" color="inherit" onClick={() => setClientToToggleStatus(null)}>
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            color={clientToToggleStatus?.is_active ? 'warning' : 'success'}
                            onClick={handleConfirmToggleStatus}
                        >
                            {clientToToggleStatus?.is_active ? 'Деактивировать' : 'Активировать'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </MobileRefreshContainer>
    );
}