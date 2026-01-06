import React, { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import { Box, Typography, Grid, Paper, Tabs, Tab} from '@mui/material';
import { MiniSpringLoader } from '../../../components/loading/MiniSpringLoader';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../../../store/apis/studentsApi';
import { useGetStudentSubscriptionsQuery, useGetSubscriptionsQuery, useAddSubscriptionToStudentMutation } from '../../../store/apis/subscriptionsApi';
import { IStudentUpdatePayload } from '../models/student';
import { IStudentSubscriptionView, IStudentSubscriptionCreatePayload } from '../../subscriptions/models/subscription';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { studentSchemas } from '../../../utils/validationSchemas';

dayjs.extend(isBetween);

// Импортируем созданные компоненты
import { StudentInfoCard } from './StudentInfoCard';
import { StudentParentInfoCard } from './StudentParentInfoCard';
import { StudentActiveSubscriptionCard } from './StudentActiveSubscriptionCard';
import { StudentSubscriptionsTable } from './StudentSubscriptionsTable';
import { StudentForm } from './StudentForm';
// Dialog imports intentionally omitted; use StudentForm which provides its own dialog when needed
import { AddSubscriptionForm } from './AddSubscriptionForm';

// Иконки для статистики
import { StudentHeader } from './StudentHeader';
import { StudentStatistics } from './StudentStatistics';

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
            id={`student-tabpanel-${index}`}
            aria-labelledby={`student-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function StudentPage() {
    const { studentId } = useParams<{ studentId: string }>();
    // const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();

    const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const { 
        data: student, 
        isLoading: isLoadingStudent, 
        isError: isErrorStudent, 
        error: studentError,
        refetch: refetchStudent
    } = useGetStudentByIdQuery(Number(studentId), {
        skip: !studentId,
        refetchOnMountOrArgChange: true,
    });

    const { 
        data: studentSubscriptionsData, 
        isLoading: isLoadingStudentSubscriptions, 
        isError: isErrorStudentSubscriptions, 
        error: studentSubscriptionsError,
        refetch: refetchStudentSubscriptions
    } = useGetStudentSubscriptionsQuery({ studentId: Number(studentId) }, {
        skip: !studentId || !student, // Не запрашивать, если нет studentId или данных самого студента
        refetchOnMountOrArgChange: true,
    });

    const { 
        data: allBaseSubscriptionsData, 
        isLoading: isLoadingAllBaseSubscriptions,
        isError: isErrorAllBaseSubscriptions,
        error: allBaseSubscriptionsError
    } = useGetSubscriptionsQuery(undefined, {skip: !student}); // Передаем undefined как первый аргумент и skip во втором

    const [addSubscriptionToStudent, { isLoading: isAddingSubscription }] = useAddSubscriptionToStudentMutation();
    const [enrichedStudentSubscriptions, setEnrichedStudentSubscriptions] = useState<IStudentSubscriptionView[]>([]);
    const [updateStudent, { isLoading: isUpdatingStudent }] = useUpdateStudentMutation();

    useEffect(() => {
        if (isErrorStudent) {
            displaySnackbar('Ошибка загрузки данных ученика', 'error');
            console.error('StudentPage - Student Error:', studentError);
        }
        if (isErrorStudentSubscriptions) {
            displaySnackbar('Ошибка загрузки абонементов ученика', 'error');
            console.error('StudentPage - Student Subscriptions Error:', studentSubscriptionsError);
        }
        if (isErrorAllBaseSubscriptions) {
            displaySnackbar('Ошибка загрузки базовых абонементов', 'error');
            console.error('StudentPage - All Base Subscriptions Error:', allBaseSubscriptionsError);
        }
    }, [isErrorStudent, studentError, isErrorStudentSubscriptions, studentSubscriptionsError, isErrorAllBaseSubscriptions, allBaseSubscriptionsError, displaySnackbar]);

    useEffect(() => {
        if (student && studentSubscriptionsData && allBaseSubscriptionsData?.items) {
            const enriched = studentSubscriptionsData.map(sub => {
                const baseSub = allBaseSubscriptionsData.items.find(bs => bs.id === sub.subscription_id);
                return {
                    ...sub,
                    subscription_name: baseSub?.name || 'Неизвестный абонемент',
                    student_name: `${student.first_name} ${student.last_name}`,
                };
            });
            setEnrichedStudentSubscriptions(enriched);
        }
    }, [student, studentSubscriptionsData, allBaseSubscriptionsData]);

    const handleOpenAddSubscriptionModalHandler = () => {
        setIsAddSubscriptionModalOpen(true);
    };

    const handleCloseAddSubscriptionModal = () => {
        setIsAddSubscriptionModalOpen(false);
    };

    const handleAddSubscriptionSubmit = async (payload: IStudentSubscriptionCreatePayload) => {
        if (!payload.subscription_id) {
            displaySnackbar('Выберите абонемент', 'warning');
            return;
        }
        try {
            await addSubscriptionToStudent(payload).unwrap();
            displaySnackbar('Абонемент успешно добавлен ученику', 'success');
            refetchStudentSubscriptions();
            handleCloseAddSubscriptionModal();
        } catch (error) {
            const maybeError = error as { data?: { detail?: string } };
            const errorDetail = maybeError?.data?.detail || 'Ошибка при добавлении абонемента';
            displaySnackbar(errorDetail, 'error');
            console.error("Ошибка добавления абонемента:", error);
        }
    };

    const handleStudentStatusHasChanged = () => {
        refetchStudent(); // Обновляем данные студента
        // Снекбар уже отображается в StudentInfoCard, здесь можно не дублировать,
        // или можно добавить свой, если нужно другое сообщение.
    };

    const handleSubscriptionDataUpdate = () => {
        refetchStudentSubscriptions(); // Обновляем абонементы студента
        refetchStudent(); // Также обновляем данные самого студента, т.к. статус абонемента (FROZEN) может влиять на поле active_subscription_id или другие вычисляемые поля
    };

    const handleOpenEditModalHandler = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateStudent = async (values: IStudentUpdatePayload) => {
        if (!student) return;
        try {
            await updateStudent({ id: student.id, studentData: values }).unwrap();
            displaySnackbar('Данные ученика успешно обновлены', 'success');
            refetchStudent();
            handleCloseEditModal();
        } catch (error) {
            displaySnackbar('Ошибка при обновлении данных ученика', 'error');
            console.error("Ошибка обновления ученика:", error);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const calculateAge = (dateOfBirth: string): number => {
        return dayjs().diff(dayjs(dateOfBirth), 'year');
    };

    if (isLoadingStudent || (student && (isLoadingAllBaseSubscriptions || isLoadingStudentSubscriptions && !studentSubscriptionsData))) {
        // Показываем основной лоадер, если грузится студент, 
        // или если студент загружен, но еще грузятся его абонементы или базовые абонементы
        return <MiniSpringLoader />;
    }

    if (!student) {
        return <Typography sx={{p:3, textAlign: 'center'}}>Ученик не найден или произошла ошибка загрузки.</Typography>;
    }

    // Статистика студента
    const activeSubscriptions = enrichedStudentSubscriptions.filter(sub => sub.status === 'active');
    const hasActiveOrFrozenSubscription = enrichedStudentSubscriptions.some(
        (sub) => sub.status === 'active' || sub.status === 'frozen'
    );
    const totalSessions = enrichedStudentSubscriptions
        .filter(sub => sub.status === 'active') // Считаем только активные сессии
        .reduce((sum, sub) => sum + (sub.sessions_left || 0), 0);

    return (
        <Box sx={{ maxHeight: '90vh', overflow: "scroll", background: theme.palette.background.default }}>
            <Box
                sx={{
                    borderRadius: 3,
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
                <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                    <StudentHeader 
                        handleOpenAddSubscriptionModal={handleOpenAddSubscriptionModalHandler} 
                        handleOpenEditModal={handleOpenEditModalHandler} 
                        subscriptionInfo={{hasActiveOrFrozenSubscription, isLoadingAllBaseSubscriptions, allBaseSubscriptionsData}} 
                        student={student} 
                        age={calculateAge(student.date_of_birth)}
                        isLoadingStudent={isLoadingStudent}
                    />
                    <StudentStatistics 
                        age={calculateAge(student.date_of_birth)}
                        activeSubscriptions={activeSubscriptions.length}
                        totalSessions={totalSessions}
                        enrichedStudentSubscriptions={enrichedStudentSubscriptions.length}
                    />
                </Box>
            </Box>

            {/* Контент страницы */}
            <Box sx={{ p: 3 }}>
                {/* Табы */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        mb: 3,
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                },
                                '& .Mui-selected': {
                                    color: theme.palette.primary.main,
                                },
                                '& .MuiTabs-indicator': {
                                    background: gradients.primary,
                                    height: 3,
                                }
                            }}
                        >
                            <Tab label="Информация" />
                            <Tab label="Абонементы" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} lg={4}>
                                <StudentInfoCard student={student} onStatusHasChanged={handleStudentStatusHasChanged} />
                            </Grid>
                            <Grid item xs={12} md={6} lg={4}>
                                <StudentParentInfoCard parentData={student.client} />
                            </Grid>
                            <Grid item xs={12} md={12} lg={4}>
                                <StudentActiveSubscriptionCard 
                                    subscriptions={enrichedStudentSubscriptions}
                                    isLoading={isLoadingStudentSubscriptions}
                                    studentId={student.id}
                                    onSubscriptionUpdate={handleSubscriptionDataUpdate}
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <StudentSubscriptionsTable 
                            subscriptions={enrichedStudentSubscriptions}
                            isLoading={isLoadingStudentSubscriptions}
                        />
                    </TabPanel>
                </Paper>
            </Box>

            {/* Модальные окна */}
            <StudentForm 
                open={isEditModalOpen} 
                onClose={handleCloseEditModal}
                initialValues={{
                    first_name: student.first_name,
                    last_name: student.last_name,
                    date_of_birth: dayjs(student.date_of_birth),
                    client_id: student.client.id,
                }}
                validationSchema={studentSchemas.update}
                onSubmit={handleUpdateStudent}
                isLoading={isUpdatingStudent}
                title="Редактировать данные ученика"
                subtitle="Обновите информацию об ученике"
                isEdit={true}
            />
            <AddSubscriptionForm 
                open={isAddSubscriptionModalOpen}
                studentId={student.id}
                availableSubscriptions={allBaseSubscriptionsData?.items || []}
                onSubmit={handleAddSubscriptionSubmit}
                isLoading={isAddingSubscription}
                onClose={handleCloseAddSubscriptionModal}
            />
        </Box>
    );
} 