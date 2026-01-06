import { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import { Box, Typography} from '@mui/material';
import { MiniSpringLoader } from '../../../../components/loading/MiniSpringLoader';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../../../../store/apis/studentsApi';
import { useGetStudentSubscriptionsQuery, useGetSubscriptionsQuery, useAddSubscriptionToStudentMutation } from '../../../../store/apis/subscriptionsApi';
import { IStudentUpdatePayload } from '../../models/student';
import { IStudentSubscriptionView, IStudentSubscriptionCreatePayload } from '../../../subscriptions/models/subscription';
import { useSnackbar } from '../../../../hooks/useSnackBar';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { studentSchemas } from '../../../../utils/validationSchemas';
import { StudentForm } from '../StudentForm';
import { AddSubscriptionForm } from '../AddSubscriptionForm';
import { StudentHeader } from './StudentHeader';
import { StudentStatistics } from './StudentStatistics';
import { StudentContent } from './StudentContent';
import { headerContainerST } from '../../styles/styles';
import { calculateAge, getTotalSessions } from '../../helpers/helpers';
import { useGradients } from '../../../trainer-mobile/hooks/useGradients';

dayjs.extend(isBetween);

export function StudentPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
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
    const totalSessions = getTotalSessions(enrichedStudentSubscriptions)

    return (
        <Box sx={{ maxHeight: '90vh', overflow: "scroll", background: theme.palette.background.default }}>
            <Box sx={headerContainerST(gradients)}>
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
            <StudentContent 
                handleStudentStatusHasChanged={handleStudentStatusHasChanged} 
                handleSubscriptionDataUpdate={handleSubscriptionDataUpdate}
                enrichedStudentSubscriptions={enrichedStudentSubscriptions}
                isLoadingStudentSubscriptions={isLoadingStudentSubscriptions}
                student={student}
            />
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