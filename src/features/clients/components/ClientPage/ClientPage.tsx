import { Box, Typography, CircularProgress, Grid, Tabs, Tab, IconButton, Button, Select, MenuItem, SelectChangeEvent, Modal, Paper, alpha } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { useParams, useNavigate } from "react-router-dom";
import { useGetClientQuery } from "../../../../store/apis/clientsApi";
import { useSnackbar } from "../../../../hooks/useSnackBar";
import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useClients } from "../../hooks/clientManagementHooks";
import { ClientInfoCard } from "./ClientInfoCard";
import { FinancialInfoCard } from "./FinancialInfoCard";
import { StudentsDataCard } from "./StudentsDataCard";

import { ClientInvoicesDataCard } from "./ClientInvoicesDataCard";
import { useGetClientInvoicesQuery } from "../../../../store/apis/invoices";
import { InvoiceStatus } from "../../../invoices/models/invoice";
import { useCancelPaymentMutation, useGetClientPaymentsQuery } from "../../../../store/apis/paymentsApi";
import { useInvalidateQueries } from "../../../../hooks/useInvalidateQueries";
import { ClientPaymentsDataCard } from "./ClientPaymentsDataCard";
import { useListClientContactsQuery } from "../../../../store/apis/clientContactsApi";
import { ClientsForm } from "../ClientsForm";
import { IClientUserFormValues } from "../../models/client";
import dayjs, { Dayjs } from "dayjs";
import { useGradients } from "../../../trainer-mobile/hooks/useGradients";
import { useTheme } from "@mui/material";

// Иконки для статистики
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Imports for StudentForm
import { StudentForm } from "../../../students/components/StudentForm";
import { IStudentCreatePayload, IStudentUpdatePayload } from "../../../students/models/student.ts";
import { useCreateStudentMutation } from "../../../../store/apis/studentsApi";

// Новые импорты для абонементов
import { useGetSubscriptionsQuery, useLazyGetStudentSubscriptionsQuery } from "../../../../store/apis/subscriptionsApi";
import { IStudentSubscriptionResponse, IStudentSubscriptionView } from "../../../subscriptions/models/subscription";
import { ClientStudentSubscriptionsTable } from "./ClientStudentSubscriptionsTable";

// Вспомогательный компонент для панелей вкладок
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`client-tabpanel-${index}`}
            aria-labelledby={`client-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `client-tab-${index}`,
        'aria-controls': `client-tabpanel-${index}`,
    };
}

// Тип для формы студента, как он определен в StudentForm.tsx
interface StudentFormValuesClientPage {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
    client_id: number | null;
}

// Базовые начальные значения для формы добавления студента к клиенту
const baseInitialStudentValuesClientPage: StudentFormValuesClientPage = {
    first_name: '',
    last_name: '',
    date_of_birth: null,
    client_id: null,
};

// Компонент статистической карточки
interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, gradient }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                background: gradient,
                borderRadius: 3,
                color: 'white',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                }
            }}
        >
            <Box sx={{ mb: 1 }}>
                {icon}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {label}
            </Typography>
        </Paper>
    );
};

// Компонент статистики клиента
interface ClientStatsProps {
    studentsCount: number;
    invoicesCount: number;
    paymentsCount: number;
    balance: number;
}

const ClientStats: React.FC<ClientStatsProps> = ({ studentsCount, invoicesCount, paymentsCount, balance }) => {
    const gradients = useGradients();
    
    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
                <StatCard
                    icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                    value={studentsCount}
                    label="Учеников"
                    gradient={gradients.primary}
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <StatCard
                    icon={<ReceiptIcon sx={{ fontSize: 32 }} />}
                    value={invoicesCount}
                    label="Инвойсов"
                    gradient={gradients.info}
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <StatCard
                    icon={<PaymentIcon sx={{ fontSize: 32 }} />}
                    value={paymentsCount}
                    label="Платежей"
                    gradient={gradients.success}
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <StatCard
                    icon={<AccountBalanceIcon sx={{ fontSize: 32 }} />}
                    value={`${balance.toLocaleString()} ₽`}
                    label="Баланс"
                    gradient={gradients.warning}
                />
            </Grid>
        </Grid>
    );
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: '50%' }, 
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
};

export function ClientPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const { getClientStudents } = useClients();
    const theme = useTheme();
    const gradients = useGradients();
    const { data: contactTasks } = useListClientContactsQuery({ status: 'PENDING' });
    
    const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<InvoiceStatus | null>(null);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
    
    const [activeTab, setActiveTab] = React.useState(0);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
    const [cancelPaymentModalOpen, setCancelPaymentModalOpen] = useState(false);
    const [paymentToCancelId, setPaymentToCancelId] = useState<number | null>(null);

    // State for StudentForm initial values when adding to a client
    const [studentFormInitialValues, setStudentFormInitialValues] = useState<StudentFormValuesClientPage>(baseInitialStudentValuesClientPage);

    // Mutation for creating a student
    const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();


    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const { data: invoices, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useGetClientInvoicesQuery(
        {client_id: Number(clientId), status: selectedInvoiceStatus},
        {refetchOnMountOrArgChange: true}
    );

    const { 
        data: payments,
        isLoading: isLoadingPayments,
        refetch: refetchPayments 
    } = useGetClientPaymentsQuery(
        { clientId: Number(clientId), status: selectedPaymentStatus }, 
        { refetchOnMountOrArgChange: true }
    );  
    const [cancelPayment, {isLoading: isCancellingPayment}] = useCancelPaymentMutation();
    const { 
        data: client, 
        isLoading: isLoadingClient, 
        isError: isErrorClient, 
        error: clientError,
        refetch: refetchClient
    } = useGetClientQuery(Number(clientId), {
        refetchOnMountOrArgChange: true
    });
    
    const { 
        data: studentsList, 
        isLoading: isLoadingStudents, 
        isError: isErrorStudents,
        error: studentsError,
        refetch: refetchStudents
    } = getClientStudents(Number(clientId));

    const { data: allSubscriptionsData, isLoading: isLoadingAllSubscriptions } = useGetSubscriptionsQuery();
    const allSubscriptions = allSubscriptionsData?.items;

    const [triggerGetStudentSubscriptions, { isLoading: isLoadingIndividualStudentSubs }] = useLazyGetStudentSubscriptionsQuery();

    const [clientStudentSubscriptions, setClientStudentSubscriptions] = useState<IStudentSubscriptionView[]>([]);
    const [isLoadingCombinedSubscriptions, setIsLoadingCombinedSubscriptions] = useState<boolean>(false);
    
    // Эффект для загрузки абонементов всех студентов клиента
    useEffect(() => {
        const fetchSubscriptionsForAllStudents = async () => {
            if (studentsList && studentsList.length > 0 && allSubscriptions) {
                setIsLoadingCombinedSubscriptions(true);
                
                const studentSubscriptionPromises = studentsList.map(student =>
                    triggerGetStudentSubscriptions({ studentId: student.id }, false).unwrap()
                );

                try {
                    const results = await Promise.allSettled(studentSubscriptionPromises);
                    
                    let combinedSubscriptionsAggregator: IStudentSubscriptionView[] = [];
                    results.forEach((settledResult, index) => {
                        const student = studentsList[index]; 
                        if (settledResult.status === 'fulfilled' && settledResult.value) {
                            const studentSubs = settledResult.value as IStudentSubscriptionResponse[]; 
                            const enrichedSubs = studentSubs.map(s => {
                                const baseSub = allSubscriptions.find(bs => bs.id === s.subscription_id);
                                return {
                                    ...s,
                                    subscription_name: baseSub?.name || 'Неизвестный абонемент',
                                    student_name: `${student.first_name} ${student.last_name}`,
                                };
                            });
                            combinedSubscriptionsAggregator = [...combinedSubscriptionsAggregator, ...enrichedSubs];
                        } else if (settledResult.status === 'rejected') {
                            console.error(`Не удалось получить абонементы для ученика ${student.id}:`, settledResult.reason);
                        }
                    });
                    
                    setClientStudentSubscriptions(combinedSubscriptionsAggregator);

                } catch (e) {
                    console.error("Общая ошибка при получении абонементов учеников:", e);
                    displaySnackbar("Ошибка при загрузке данных по абонементам", "error");
                } finally {
                    setIsLoadingCombinedSubscriptions(false);
                }

            } else if (studentsList && studentsList.length === 0) {
                setClientStudentSubscriptions([]);
                setIsLoadingCombinedSubscriptions(false);
            } else if (!allSubscriptions && !isLoadingAllSubscriptions && studentsList && studentsList.length > 0) {
                 displaySnackbar("Не удалось загрузить базовые типы абонементов. Информация об абонементах учеников может быть неполной.", "warning");
                 setIsLoadingCombinedSubscriptions(false);
            }
        };

        if (activeTab === 4) {
            fetchSubscriptionsForAllStudents();
        }
    }, [studentsList, allSubscriptions, triggerGetStudentSubscriptions, displaySnackbar, isLoadingAllSubscriptions, activeTab]);

    const invalidateQueries = useInvalidateQueries([
        refetchPayments, 
        refetchInvoices, 
        refetchStudents, 
        refetchClient,
    ]);

    useEffect(() => {
        if (isErrorClient) {
            displaySnackbar("Ошибка при загрузке данных клиента", "error");
            console.error("Ошибка получения данных клиента:", clientError);
        }
        if (isErrorStudents) {
            displaySnackbar("Ошибка при загрузке списка учеников", "error");
            console.error("Ошибка получения списка учеников:", studentsError);
        }
    }, [isErrorClient, clientError, isErrorStudents, studentsError, displaySnackbar]);

    const handleOpenEditModal = () => setEditModalOpen(true);
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        refetchClient();
    };

    const handleOpenAddStudentModal = () => {
        if (client) {
            setStudentFormInitialValues({
                first_name: '',
                last_name: client.last_name,
                date_of_birth: null,
                client_id: client.id,
            });
        } else {
            setStudentFormInitialValues(baseInitialStudentValuesClientPage);
        }
        setAddStudentModalOpen(true);
    };
    const handleCloseAddStudentModal = () => {
        setAddStudentModalOpen(false);
    };

    const handleCreateStudentSubmit = async (values: IStudentUpdatePayload) => {
        if (!clientId) return;

        if (!values.first_name || !values.last_name || !values.date_of_birth) {
            displaySnackbar('Все поля (Имя, Фамилия, Дата рождения) должны быть заполнены.', 'error');
            return;
        }

        const payload: IStudentCreatePayload = {
            first_name: values.first_name,
            last_name: values.last_name,
            date_of_birth: values.date_of_birth,
            client_id: Number(clientId),
        };

        try {
            await createStudent(payload).unwrap();
            displaySnackbar("Ученик успешно добавлен клиенту", "success");
            handleCloseAddStudentModal();
            refetchStudents();
        } catch (err: any) {
            console.error("Ошибка добавления ученика клиенту:", err);
            const errorDetail = err?.data?.detail || 'Не удалось добавить ученика';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleOpenCancelPaymentModal = (paymentId: number) => {
        setPaymentToCancelId(paymentId);
        setCancelPaymentModalOpen(true);
    };

    const handleCloseCancelPaymentModal = () => {
        setPaymentToCancelId(null);
        setCancelPaymentModalOpen(false);
    };

    const confirmCancelPayment = async () => {
        if (paymentToCancelId) {
            try {
                await cancelPayment({ paymentId: paymentToCancelId }).unwrap();
                displaySnackbar("Платеж успешно отменен", "success");
                invalidateQueries();
            } catch (err) {
                displaySnackbar("Ошибка при отмене платежа", "error");
                console.error("Ошибка отмены платежа:", err);
            }
        }
        handleCloseCancelPaymentModal();
    };

    const initialFormValues: IClientUserFormValues | undefined = client ? {
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone_country_code ? `${client.phone_country_code}${client.phone_number}` : '',
        date_of_birth: client.date_of_birth ? dayjs(client.date_of_birth) : null, 
        whatsapp_number: client.whatsapp_country_code ? `${client.whatsapp_country_code}${client.whatsapp_number}` : '',
        is_student: false,
        students: [],
    } : undefined;

    const handleInvoiceStatusChange = (event: SelectChangeEvent<InvoiceStatus | "ALL">) => {
        const value = event.target.value;
        setSelectedInvoiceStatus(value === "ALL" ? null : value as InvoiceStatus);
    };

    const handlePaymentStatusChange = (event: SelectChangeEvent<string>) => {
        setSelectedPaymentStatus(event.target.value as string);
    };

    if (isLoadingClient) return <CircularProgress />;
    if (isErrorClient || !client) return <Typography>Ошибка загрузки данных клиента.</Typography>;

    // Вычисляем статистику
    const studentsCount = studentsList?.length || 0;
    const invoicesCount = invoices?.items?.length || 0;
    const paymentsCount = payments?.length || 0;
    const balance = client.balance || 0;

    return (
        <Box sx={{ p: 3 , maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Градиентный заголовок */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 3,
                    background: gradients.primary,
                    borderRadius: 3,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton 
                            onClick={handleBackClick} 
                            sx={{ 
                                color: 'white',
                                mr: 2,
                                '&:hover': {
                                    background: alpha('#ffffff', 0.2),
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center' }}>
                                👤 {client.first_name} {client.last_name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                                Карточка клиента #{client.id}
                            </Typography>
                        </Box>
                        <IconButton 
                            onClick={handleOpenEditModal} 
                            sx={{
                                color: 'white',
                                '&:hover': {
                                    background: alpha('#ffffff', 0.2),
                                }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            {/* Статистика клиента */}
            <ClientStats
                studentsCount={studentsCount}
                invoicesCount={invoicesCount}
                paymentsCount={paymentsCount}
                balance={balance}
            />

            {/* Стилизованные табы */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="Client details tabs"
                    sx={{
                        background: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                background: theme.palette.background.paper,
                            },
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }
                        },
                        '& .MuiTabs-indicator': {
                            background: gradients.primary,
                            height: 3,
                        }
                    }}
                >
                    <Tab label="📊 Обзор" {...a11yProps(0)} />
                    <Tab label="📄 Инвойсы" {...a11yProps(1)} />
                    <Tab label="💳 Платежи" {...a11yProps(2)} />
                    <Tab label="👥 Ученики" {...a11yProps(3)} />
                    <Tab label="🎫 Абонементы" {...a11yProps(4)} />
                </Tabs>
            </Paper>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} md={6} >
                        {client && <ClientInfoCard client={client} onClientUpdate={refetchClient} />}
                        {client && (contactTasks ?? []).some(t => t.client_id === client.id) && (
                            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fff3cd' }}>
                                <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600 }}>
                                    Этому клиенту нужен звонок
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                        {client && <FinancialInfoCard client={client} invoices={invoices?.items || []} invalidateFunction={invalidateQueries} />}
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Инвойсы клиента</Typography>
                    <Select
                        value={selectedInvoiceStatus ?? "ALL"}
                        onChange={handleInvoiceStatusChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value={"ALL"}>Все статусы</MenuItem>
                        <MenuItem value={"UNPAID"}>Неоплаченные</MenuItem>
                        <MenuItem value={"PAID"}>Оплаченные</MenuItem>
                        <MenuItem value={"CANCELLED"}>Отмененные</MenuItem>
                    </Select>
                </Box>
                <ClientInvoicesDataCard 
                    invoices={invoices?.items} 
                    isLoading={isLoadingInvoices} 
                />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Платежи клиента</Typography>
                    <Select
                        value={selectedPaymentStatus}
                        onChange={handlePaymentStatusChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value={"all"}>Все платежи</MenuItem>
                        <MenuItem value={"not_cancelled"}>Принятые</MenuItem>
                        <MenuItem value={"cancelled"}>Отмененные</MenuItem>
                    </Select>
                </Box>
                <ClientPaymentsDataCard 
                    payments={payments} 
                    isLoading={isLoadingPayments} 
                    handleCancelPayment={handleOpenCancelPaymentModal} 
                />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Ученики клиента</Typography>
                    <Button variant="contained" onClick={handleOpenAddStudentModal} disabled={!client}>
                        Добавить ученика клиенту
                    </Button>
                </Box>
                <StudentsDataCard students={studentsList || []} isLoading={isLoadingStudents} allSubscriptions={allSubscriptions} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
                 <ClientStudentSubscriptionsTable 
                    subscriptions={clientStudentSubscriptions} 
                    isLoading={isLoadingCombinedSubscriptions || isLoadingAllSubscriptions || isLoadingIndividualStudentSubs}
                 />
            </TabPanel>

            <Modal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-client-modal-title"
            >
                <Box sx={modalStyle}>
                    {/* Градиентный заголовок модального окна */}
                    <Box
                        sx={{
                            p: 3,
                            background: gradients.primary,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography id="edit-client-modal-title" variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                ✏️ Редактировать данные клиента
                            </Typography>
                            <IconButton
                                aria-label="Закрыть"
                                onClick={handleCloseEditModal}
                                sx={{
                                    color: 'white',
                                    ml: 2,
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.15),
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            </IconButton>
                        </Box>
                    </Box>
                    
                    {/* Контент модального окна */}
                    <Box sx={{ p: 3 }}>
                        {initialFormValues && client && (
                            <ClientsForm
                                title="Редактировать данные клиента"
                                initialValues={initialFormValues}
                                isEdit={true}
                                clientId={client.id}
                                onClose={handleCloseEditModal}
                            />
                        )}
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={addStudentModalOpen}
                onClose={handleCloseAddStudentModal}
                aria-labelledby="add-student-to-client-modal-title"
            >
                <Box sx={modalStyle}>
                    {/* Градиентный заголовок модального окна */}
                    <Box
                        sx={{
                            p: 3,
                            background: gradients.success,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography id="add-student-to-client-modal-title" variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                👤 Добавить ученика клиенту
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                {client?.first_name} {client?.last_name}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Контент модального окна */}
                    <Box sx={{ p: 3 }}>
                        <StudentForm
                            initialValues={studentFormInitialValues}
                            onSubmit={handleCreateStudentSubmit}
                            onClose={handleCloseAddStudentModal}
                            isLoading={isCreatingStudent}
                        />
                    </Box>
                </Box>
            </Modal>

            <Dialog
                open={cancelPaymentModalOpen}
                onClose={handleCloseCancelPaymentModal}
                aria-labelledby="alert-dialog-cancel-payment-title"
                aria-describedby="alert-dialog-cancel-payment-description"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                    }
                }}
            >
                {/* Градиентный заголовок диалога */}
                <Box
                    sx={{
                        p: 3,
                        background: gradients.warning,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            opacity: 0.3,
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography id="alert-dialog-cancel-payment-title" variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            ⚠️ Подтверждение отмены платежа
                        </Typography>
                    </Box>
                </Box>
                
                <DialogContent sx={{ p: 3 }}>
                    <DialogContentText id="alert-dialog-cancel-payment-description" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        Вы уверены, что хотите отменить этот платеж? Это действие не может быть отменено.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        onClick={handleCloseCancelPaymentModal} 
                        disabled={isCancellingPayment}
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={confirmCancelPayment} 
                        color="error" 
                        autoFocus 
                        disabled={isCancellingPayment}
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: gradients.warning,
                            '&:hover': {
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)'
                                    : 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
                            }
                        }}
                    >
                        {isCancellingPayment ? <CircularProgress size={24} /> : "Подтвердить отмену"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 