import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Grid, Paper, IconButton, Button, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Checkbox, FormControlLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../../../store/apis/studentsApi';
import { useGetStudentSubscriptionsQuery, useGetSubscriptionsQuery, useAddSubscriptionToStudentMutation } from '../../../store/apis/subscriptionsApi';
import { IStudent, IStudentUpdatePayload } from '../models/student';
import { IStudentSubscriptionView, ISubscriptionResponse, IStudentSubscriptionCreatePayload } from '../../subscriptions/models/subscription';
import { useSnackbar } from '../../../hooks/useSnackBar';
import dayjs from 'dayjs'; // Нужен для конвертации даты рождения для формы

// Импортируем созданные компоненты
import { StudentInfoCard } from './StudentInfoCard';
import { StudentParentInfoCard } from './StudentParentInfoCard';
import { StudentActiveSubscriptionCard } from './StudentActiveSubscriptionCard';
import { StudentSubscriptionsTable } from './StudentSubscriptionsTable';
import { StudentForm } from './StudentForm'; // Импортируем форму
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AddSubscriptionForm } from './AddSubscriptionForm'; // Импортируем новую форму

export function StudentPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();

    const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            displaySnackbar('Ошибка загрузки данных студента', 'error');
            console.error('StudentPage - Student Error:', studentError);
        }
        if (isErrorStudentSubscriptions) {
            displaySnackbar('Ошибка загрузки абонементов студента', 'error');
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

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleOpenAddSubscriptionModal = () => {
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
            displaySnackbar('Абонемент успешно добавлен студенту', 'success');
            refetchStudentSubscriptions();
            handleCloseAddSubscriptionModal();
        } catch (error) {
            displaySnackbar('Ошибка при добавлении абонемента', 'error');
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

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateStudent = async (values: IStudentUpdatePayload) => {
        if (!student) return;
        try {
            await updateStudent({ id: student.id, studentData: values }).unwrap();
            displaySnackbar('Данные студента успешно обновлены', 'success');
            refetchStudent();
            handleCloseEditModal();
        } catch (error) {
            displaySnackbar('Ошибка при обновлении данных студента', 'error');
            console.error("Ошибка обновления студента:", error);
        }
    };

    if (isLoadingStudent || (student && (isLoadingAllBaseSubscriptions || isLoadingStudentSubscriptions && !studentSubscriptionsData))) {
        // Показываем основной лоадер, если грузится студент, 
        // или если студент загружен, но еще грузятся его абонементы или базовые абонементы
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!student) {
        return <Typography sx={{p:3, textAlign: 'center'}}>Студент не найден или произошла ошибка загрузки.</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleBackClick}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Button 
                        variant="contained" 
                        onClick={handleOpenAddSubscriptionModal}
                        disabled={isLoadingAllBaseSubscriptions || !allBaseSubscriptionsData?.items?.length}
                        sx={{ mr: 1 }}
                    >
                        Добавить абонемент
                    </Button>
                    <IconButton onClick={handleOpenEditModal} color="primary" disabled={!student || isLoadingStudent}>
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{mb: 3}}>
                Ученик: {student.first_name} {student.last_name}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                    <StudentInfoCard student={student} onStatusHasChanged={handleStudentStatusHasChanged} />
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <StudentParentInfoCard parentData={student.client} />
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <StudentActiveSubscriptionCard 
                        subscriptions={enrichedStudentSubscriptions} 
                        isLoading={isLoadingStudentSubscriptions}
                        studentId={Number(studentId)}
                        onSubscriptionUpdate={handleSubscriptionDataUpdate}
                    />
                </Grid>

                <Grid item xs={12}>
                  
                        <Typography variant="h6" gutterBottom>
                            Все абонементы ученика
                        </Typography>
                        <StudentSubscriptionsTable 
                            subscriptions={enrichedStudentSubscriptions} 
                            isLoading={isLoadingStudentSubscriptions} 
                        />
                    
                </Grid>
            </Grid>

            {studentId && (
                <AddSubscriptionForm
                    open={isAddSubscriptionModalOpen}
                    onClose={handleCloseAddSubscriptionModal}
                    onSubmit={handleAddSubscriptionSubmit}
                    isLoading={isAddingSubscription}
                    studentId={Number(studentId)}
                    availableSubscriptions={allBaseSubscriptionsData?.items || []}
                    isLoadingSubscriptions={isLoadingAllBaseSubscriptions}
                />
            )}

            {/* Модальное окно редактирования студента возвращено к Modal */}
            <Dialog 
                open={isEditModalOpen} 
                onClose={handleCloseEditModal} 
                aria-labelledby="edit-student-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '70%', md: 500 },
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <Typography id="edit-student-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Редактировать данные ученика
                    </Typography>
                    {student && (
                        <StudentForm 
                            initialValues={{
                                first_name: student.first_name,
                                last_name: student.last_name,
                                date_of_birth: student.date_of_birth ? dayjs(student.date_of_birth) : null,
                            }}
                            onSubmit={handleUpdateStudent}
                            onClose={handleCloseEditModal}
                            isLoading={isUpdatingStudent}
                        />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
} 