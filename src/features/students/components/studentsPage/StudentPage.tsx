import { useEffect, useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { Box, Typography, SpeedDial, SpeedDialAction, SpeedDialIcon, IconButton, Paper, alpha } from '@mui/material';
import { MiniSpringLoader } from '../../../../components/loading/MiniSpringLoader';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../../../../store/apis/studentsApi';
import { useGetStudentSubscriptionsQuery, useGetSubscriptionsQuery, useAddSubscriptionToStudentMutation, useFreezeStudentSubscriptionMutation, useUnfreezeStudentSubscriptionMutation } from '../../../../store/apis/subscriptionsApi';
import { IStudentUpdatePayload } from '../../models/student';
import { IStudentSubscriptionView, IStudentSubscriptionCreatePayload, IStudentSubscriptionFreezePayload } from '../../../subscriptions/models/subscription';
import { useSnackbar } from '../../../../hooks/useSnackBar';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Dayjs } from 'dayjs';
import { studentSchemas } from '../../../../utils/validationSchemas';
import { StudentForm } from '../StudentForm';
import { AddSubscriptionForm } from '../AddSubscriptionForm';
import { FreezeSubscriptionForm } from '../FreezeSubscriptionForm';
import { StudentStatistics } from './StudentStatistics';
import { StudentContent } from './StudentContent';
import { calculateAge, getTotalSessions } from '../../helpers/helpers';
import { useGradients } from '../../../trainer-mobile/hooks/useGradients';
import EditIcon from '@mui/icons-material/Edit';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { MobileFormBottomSheet } from '../../../../components/mobile-kit';
import useMobile from '../../../../hooks/useMobile';

dayjs.extend(isBetween);

export function StudentPage() {
    const isMobile = useMobile();
    const isBottomSheetFormEnabled = isMobile && import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

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
    const [freezeSubscription, { isLoading: isFreezing }] = useFreezeStudentSubscriptionMutation();
    const [unfreezeSubscription, { isLoading: isUnfreezing }] = useUnfreezeStudentSubscriptionMutation();
    const [enrichedStudentSubscriptions, setEnrichedStudentSubscriptions] = useState<IStudentSubscriptionView[]>([]);
    const [updateStudent, { isLoading: isUpdatingStudent }] = useUpdateStudentMutation();

    const activeSubscription = enrichedStudentSubscriptions.find((sub) =>
        dayjs().isBetween(dayjs(sub.start_date), dayjs(sub.end_date), null, '[]')
    );
    const isSubscriptionFrozen = !!(activeSubscription?.freeze_start_date && activeSubscription?.freeze_end_date);

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

    const handleOpenFreezeModal = () => {
        setIsFreezeModalOpen(true);
    };

    const handleCloseFreezeModal = () => {
        setIsFreezeModalOpen(false);
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

    interface FreezeFormValues {
        freeze_start_date: Dayjs | null;
        freeze_duration_days: number;
    }

    const handleFreezeSubmit = async (values: FreezeFormValues) => {
        if (!activeSubscription || !values.freeze_start_date) return;

        const payload: IStudentSubscriptionFreezePayload = {
            freeze_start_date: values.freeze_start_date.toISOString(),
            freeze_duration_days: values.freeze_duration_days,
        };

        try {
            await freezeSubscription({ studentSubscriptionId: activeSubscription.id, payload }).unwrap();
            displaySnackbar('Абонемент успешно заморожен', 'success');
            handleCloseFreezeModal();
            handleSubscriptionDataUpdate();
        } catch (error: any) {
            console.error('Ошибка заморозки абонемента:', error);
            const errorDetail = error?.data?.detail || 'Ошибка при заморозке абонемента';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const handleUnfreeze = async () => {
        if (!activeSubscription || !student) return;

        try {
            await unfreezeSubscription({ studentSubscriptionId: activeSubscription.id, studentId: Number(studentId) }).unwrap();
            displaySnackbar('Абонемент успешно разморожен', 'success');
            handleSubscriptionDataUpdate();
        } catch (error: any) {
            console.error('Ошибка разморозки абонемента:', error);
            const errorDetail = error?.data?.detail || 'Ошибка при разморозке абонемента';
            displaySnackbar(String(errorDetail), 'error');
        }
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

    const handleBackClick = () => {
        navigate(-1);
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
    const totalSessions = getTotalSessions(enrichedStudentSubscriptions)

    return (
        <Box sx={{ maxHeight: '90vh', overflow: "scroll", background: theme.palette.background.default }}>
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
                                👤 {student.first_name} {student.last_name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                                Карточка ученика #{student.id} • {calculateAge(student.date_of_birth)} лет
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <StudentStatistics 
                age={calculateAge(student.date_of_birth)}
                activeSubscriptions={activeSubscriptions.length}
                totalSessions={totalSessions}
                enrichedStudentSubscriptions={enrichedStudentSubscriptions.length}
            />
            <StudentContent 
                handleStudentStatusHasChanged={handleStudentStatusHasChanged} 
                handleSubscriptionDataUpdate={handleSubscriptionDataUpdate}
                enrichedStudentSubscriptions={enrichedStudentSubscriptions}
                isLoadingStudentSubscriptions={isLoadingStudentSubscriptions}
                student={student}
            />
            {isBottomSheetFormEnabled ? (
                <MobileFormBottomSheet
                    open={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    title="✏️ Редактировать данные ученика"
                >
                    <StudentForm 
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
                        isEdit={true}
                    />
                </MobileFormBottomSheet>
            ) : (
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
            )}
            <AddSubscriptionForm 
                open={isAddSubscriptionModalOpen}
                studentId={student.id}
                availableSubscriptions={allBaseSubscriptionsData?.items || []}
                onSubmit={handleAddSubscriptionSubmit}
                isLoading={isAddingSubscription}
                onClose={handleCloseAddSubscriptionModal}
                useBottomSheetVariant={isBottomSheetFormEnabled}
            />

            <FreezeSubscriptionForm
                open={isFreezeModalOpen}
                onClose={handleCloseFreezeModal}
                onSubmit={handleFreezeSubmit}
                isLoading={isFreezing}
                activeSubscriptionName={activeSubscription?.subscription_name}
                activeSubscriptionEndDate={
                    activeSubscription?.end_date ? dayjs(activeSubscription.end_date).format('DD.MM.YYYY') : undefined
                }
                useBottomSheetVariant={isBottomSheetFormEnabled}
            />

            <SpeedDial
                ariaLabel="Student detail actions"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    '& .MuiFab-primary': {
                        background: gradients.primary,
                        color: 'white',
                        '&:hover': {
                            background: gradients.primary,
                            filter: 'brightness(0.95)',
                        },
                    },
                }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    icon={<EditIcon />}
                    tooltipTitle="Редактировать ученика"
                    onClick={handleOpenEditModalHandler}
                    FabProps={{
                        sx: {
                            background: gradients.primary,
                            color: 'white',
                            '&:hover': { background: gradients.primary, filter: 'brightness(0.95)' },
                        },
                    }}
                />
                <SpeedDialAction
                    icon={<LibraryAddIcon />}
                    tooltipTitle="Добавить абонемент"
                    onClick={handleOpenAddSubscriptionModalHandler}
                    FabProps={{
                        sx: {
                            background: gradients.success,
                            color: 'white',
                            '&:hover': { background: gradients.success, filter: 'brightness(0.95)' },
                        },
                    }}
                />
                {activeSubscription && (
                    <SpeedDialAction
                        icon={isSubscriptionFrozen ? <WbSunnyOutlinedIcon /> : <AcUnitIcon />}
                        tooltipTitle={isSubscriptionFrozen ? 'Разморозить абонемент' : 'Заморозить абонемент'}
                        onClick={isSubscriptionFrozen ? handleUnfreeze : handleOpenFreezeModal}
                        FabProps={{
                            disabled: isFreezing || isUnfreezing || isLoadingStudentSubscriptions,
                            sx: {
                                background: isSubscriptionFrozen ? gradients.success : gradients.warning,
                                color: 'white',
                                '&:hover': {
                                    background: isSubscriptionFrozen ? gradients.success : gradients.warning,
                                    filter: 'brightness(0.95)',
                                },
                            },
                        }}
                    />
                )}
            </SpeedDial>
        </Box>
    );
} 