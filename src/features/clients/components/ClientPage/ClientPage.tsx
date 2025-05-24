import { Box, Typography, CircularProgress, Grid, Tabs, Tab, IconButton, Button, Select, MenuItem, SelectChangeEvent, Modal } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useParams, useNavigate } from "react-router-dom";
import { useGetClientQuery, useUpdateClientMutation } from "../../../../store/apis/clientsApi";
import { useSnackbar } from "../../../../hooks/useSnackBar";
import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useClients } from "../../hooks/clientManagementHooks";
import { ClientInfoCard } from "./ClientInfoCard";
import { FinancialInfoCard } from "./FinancialInfoCard";
import { StudentsDataCard } from "./StudentsDataCard";
import { IStudent } from "../../../students/models/student.ts";
import { ClientInvoicesDataCard } from "./ClientInvoicesDataCard";
import { useGetClientInvoicesQuery } from "../../../../store/apis/invoices";
import { InvoiceStatus } from "../../../invoices/models/invoice";
import { useCancelPaymentMutation, useGetClientPaymentsQuery } from "../../../../store/apis/paymentsApi";
import { useInvalidateQueries } from "../../../../hooks/useInvalidateQueries";
import { ClientPaymentsDataCard } from "./ClientPaymentsDataCard";
import { ClientsForm } from "../ClientsForm";
import { IClientUserFormValues, IClientUserGet, ClientUpdate } from "../../models/client";
import dayjs, { Dayjs } from "dayjs";

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
}

// Базовые начальные значения для формы добавления студента к клиенту
const baseInitialStudentValuesClientPage: StudentFormValuesClientPage = {
    first_name: '',
    last_name: '',
    date_of_birth: null,
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: '50%' }, 
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 2,
};

export function ClientPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const { getClientStudents } = useClients();
    
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
    // Mutation for updating a client
    const [updateClientMutation, { isLoading: isUpdatingClient }] = useUpdateClientMutation();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
                            console.error(`Не удалось получить абонементы для студента ${student.id}:`, settledResult.reason);
                        }
                    });
                    
                    setClientStudentSubscriptions(combinedSubscriptionsAggregator);

                } catch (e) {
                    console.error("Общая ошибка при получении абонементов студентов:", e);
                    displaySnackbar("Ошибка при загрузке данных по абонементам", "error");
                } finally {
                    setIsLoadingCombinedSubscriptions(false);
                }

            } else if (studentsList && studentsList.length === 0) {
                setClientStudentSubscriptions([]);
                setIsLoadingCombinedSubscriptions(false);
            } else if (!allSubscriptions && !isLoadingAllSubscriptions && studentsList && studentsList.length > 0) {
                 displaySnackbar("Не удалось загрузить базовые типы абонементов. Информация об абонементах студентов может быть неполной.", "warning");
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
            displaySnackbar("Ошибка при загрузке списка студентов", "error");
            console.error("Ошибка получения списка студентов:", studentsError);
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
            displaySnackbar("Студент успешно добавлен клиенту", "success");
            handleCloseAddStudentModal();
            refetchStudents();
        } catch (err: any) {
            console.error("Ошибка добавления студента клиенту:", err);
            const errorDetail = err?.data?.detail || 'Не удалось добавить студента';
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
        phone: client.phone,
        date_of_birth: client.date_of_birth ? dayjs(client.date_of_birth) : null, 
        whatsapp_number: client.whatsapp_number || '',
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

    return (
        <Box sx={{ p: 3 }}>
            <IconButton onClick={handleBackClick} sx={{ mb: 2 }}>
                <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ flexGrow: 1 }}>
                    Карточка клиента: {client.first_name} {client.last_name}
                </Typography>
                <IconButton onClick={handleOpenEditModal} color="primary">
                    <EditIcon />
                </IconButton>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Client details tabs">
                    <Tab label="Обзор" {...a11yProps(0)} />
                    <Tab label="Инвойсы" {...a11yProps(1)} />
                    <Tab label="Платежи" {...a11yProps(2)} />
                    <Tab label="Ученики" {...a11yProps(3)} />
                    <Tab label="Абонементы" {...a11yProps(4)} />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} md={6} >
                        {client && <ClientInfoCard client={client} onClientUpdate={refetchClient} />}
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
                        Добавить студента клиенту
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
                    <Typography id="edit-client-modal-title" variant="h6" component="h2" sx={{mb:2}}>
                        Редактировать данные клиента
                    </Typography>
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
            </Modal>

            <Modal
                open={addStudentModalOpen}
                onClose={handleCloseAddStudentModal}
                aria-labelledby="add-student-to-client-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="add-student-to-client-modal-title" variant="h6" component="h2" sx={{mb:2}}>
                        Добавить студента клиенту: {client?.first_name} {client?.last_name}
                    </Typography>
                    <StudentForm
                        initialValues={studentFormInitialValues}
                        onSubmit={handleCreateStudentSubmit}
                        onClose={handleCloseAddStudentModal}
                        isLoading={isCreatingStudent}
                    />
                </Box>
            </Modal>

            <Dialog
                open={cancelPaymentModalOpen}
                onClose={handleCloseCancelPaymentModal}
                aria-labelledby="alert-dialog-cancel-payment-title"
                aria-describedby="alert-dialog-cancel-payment-description"
            >
                <DialogTitle id="alert-dialog-cancel-payment-title">
                    {"Подтверждение отмены платежа"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-cancel-payment-description">
                        Вы уверены, что хотите отменить этот платеж? Это действие не может быть отменено.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelPaymentModal} disabled={isCancellingPayment}>Отмена</Button>
                    <Button onClick={confirmCancelPayment} color="error" autoFocus disabled={isCancellingPayment}>
                        {isCancellingPayment ? <CircularProgress size={24} /> : "Подтвердить отмену"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 