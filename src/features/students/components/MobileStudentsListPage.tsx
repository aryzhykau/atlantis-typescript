import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { IStudent, IStudentCreatePayload, IStudentUpdatePayload } from '../models/student';
import { useCreateStudentMutation, useGetStudentsQuery, useUpdateStudentMutation, useUpdateStudentStatusMutation } from '../../../store/apis/studentsApi';
import { useLazyGetStudentSubscriptionsQuery } from '../../../store/apis/subscriptionsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import {
  MetricPillCard,
  MobileCollapsibleSearch,
  MobileFilterBottomSheet,
  MobileFormBottomSheet,
  MobilePageShell,
  MobileRefreshContainer,
  SwipeableActionCard,
} from '../../../components/mobile-kit';
import { StudentMobileCardV2 } from './StudentMobileCardV2';
import { StudentForm } from './StudentForm';
import { studentSchemas } from '../../../utils/validationSchemas';

export function MobileStudentsListPage() {
  const navigate = useNavigate();
  const gradients = useGradients();
  const { displaySnackbar } = useSnackbar();
  const isBottomSheetFormEnabled = import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';

  const { data: studentsResponse, isLoading, isError, isFetching, refetch } = useGetStudentsQuery();
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdatingStudent }] = useUpdateStudentMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();
  const [triggerGetStudentSubscriptions] = useLazyGetStudentSubscriptionsQuery();

  const students = studentsResponse || [];

  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showWithSubscriptionOnly, setShowWithSubscriptionOnly] = useState(false);
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('atlantis_mobile_students_swipe_tip_seen') !== '1';
  });

  const [studentToToggleStatus, setStudentToToggleStatus] = useState<IStudent | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<IStudent | null>(null);
  const [studentSubscriptionPresenceMap, setStudentSubscriptionPresenceMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const resolveStudentSubscriptions = async () => {
      if (!students.length) {
        if (isMounted) setStudentSubscriptionPresenceMap({});
        return;
      }

      const requests = students.map(async (student) => {
        try {
          const studentSubscriptions = await triggerGetStudentSubscriptions(
            { studentId: student.id, includeExpired: false },
            false
          ).unwrap();

          const hasSubscription = studentSubscriptions.some((subscription) => {
            const status = subscription.status?.toUpperCase();
            return status !== 'EXPIRED' && status !== 'CANCELLED';
          });

          return [student.id, hasSubscription] as const;
        } catch {
          return [student.id, Boolean(student.active_subscription_id)] as const;
        }
      });

      const resolved = await Promise.all(requests);
      if (!isMounted) return;

      const nextMap = resolved.reduce<Record<number, boolean>>((acc, [studentId, hasSubscription]) => {
        acc[studentId] = hasSubscription;
        return acc;
      }, {});

      setStudentSubscriptionPresenceMap(nextMap);
    };

    resolveStudentSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [students, triggerGetStudentSubscriptions]);

  const hasSubscription = (student: IStudent) => {
    const resolved = studentSubscriptionPresenceMap[student.id];
    return resolved ?? Boolean(student.active_subscription_id);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (showOnlyActive && !student.is_active) return false;
      if (showWithSubscriptionOnly && !hasSubscription(student)) return false;

      if (!searchValue.trim()) return true;

      const query = searchValue.toLowerCase().trim();
      const parentName = `${student.client?.first_name ?? ''} ${student.client?.last_name ?? ''}`.toLowerCase();
      return [
        student.first_name,
        student.last_name,
        `${student.first_name} ${student.last_name}`,
        student.client?.email,
        parentName,
        student.client?.phone_number,
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [students, showOnlyActive, showWithSubscriptionOnly, searchValue, studentSubscriptionPresenceMap]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((student) => student.is_active).length;
    const withSubscription = students.filter((student) => hasSubscription(student)).length;
    const inactive = students.filter((student) => !student.is_active).length;
    return { total, active, withSubscription, inactive };
  }, [students, studentSubscriptionPresenceMap]);

  const handleOpenCreate = () => {
    setStudentToEdit(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (student: IStudent) => {
    setStudentToEdit(student);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setStudentToEdit(null);
  };

  const handleCloseSwipeTip = () => {
    setShowSwipeTip(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('atlantis_mobile_students_swipe_tip_seen', '1');
    }
  };

  const handleFormSubmit = async (values: IStudentCreatePayload | IStudentUpdatePayload) => {
    try {
      if (studentToEdit) {
        await updateStudent({ id: studentToEdit.id, studentData: values as IStudentUpdatePayload }).unwrap();
        displaySnackbar('Ученик обновлен', 'success');
      } else {
        await createStudent(values as IStudentCreatePayload).unwrap();
        displaySnackbar('Ученик создан', 'success');
      }
      handleCloseForm();
      await refetch();
    } catch {
      displaySnackbar(studentToEdit ? 'Ошибка обновления ученика' : 'Ошибка создания ученика', 'error');
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!studentToToggleStatus) return;

    try {
      await updateStudentStatus({
        id: studentToToggleStatus.id,
        statusData: { is_active: !studentToToggleStatus.is_active },
      }).unwrap();
      displaySnackbar(studentToToggleStatus.is_active ? 'Ученик деактивирован' : 'Ученик активирован', 'success');
      setStudentToToggleStatus(null);
      await refetch();
    } catch {
      displaySnackbar('Ошибка обновления статуса ученика', 'error');
    }
  };

  const initialStudentValues = studentToEdit
    ? {
        first_name: studentToEdit.first_name,
        last_name: studentToEdit.last_name,
        date_of_birth: studentToEdit.date_of_birth ? dayjs(studentToEdit.date_of_birth) : null,
        client_id: studentToEdit.client?.id ?? null,
      }
    : {
        first_name: '',
        last_name: '',
        date_of_birth: null,
        client_id: null,
      };

  return (
    <MobileRefreshContainer
      onRefresh={refetch}
      isRefreshing={isFetching}
      disabled={openForm || filtersOpen || Boolean(studentToToggleStatus)}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Ученики"
        subtitle="Мобильный список учеников"
        icon={<SchoolIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Имя ученика или родителя"
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
              <MetricPillCard label="Всего" value={stats.total} gradient={gradients.primary} icon={<SchoolIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Активные" value={stats.active} gradient={gradients.success} icon={<CheckCircleIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="С абонементом" value={stats.withSubscription} gradient={gradients.info} icon={<SubscriptionsIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Неактивные" value={stats.inactive} gradient={gradients.warning} icon={<PersonOffIcon fontSize="small" />} />
            </Grid>
          </Grid>
        )}
        fab={(
          <Fab
            aria-label="add-student"
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
            onClick={handleOpenCreate}
          >
            <AddIcon />
          </Fab>
        )}
      >
        <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Список учеников
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {filteredStudents.length}
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
          {isError && <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки учеников.</Typography>}

          {!isLoading && !isError && filteredStudents.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Ученики не найдены. Измените фильтры или добавьте нового ученика.
            </Typography>
          )}

          {filteredStudents.map((student) => (
            <SwipeableActionCard
              key={student.id}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenEdit(student)}
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
                    onClick={() => setStudentToToggleStatus(student)}
                    sx={{
                      borderRadius: 0,
                      background: student.is_active ? gradients.warning : gradients.success,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: student.is_active ? gradients.warning : gradients.success,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    {student.is_active ? 'Статус' : 'Актив.'}
                  </Button>
                </Stack>
              )}
              revealWidth={176}
            >
              <StudentMobileCardV2
                student={student}
                onOpen={() => navigate(`/home/students/${student.id}`)}
                hasSubscription={hasSubscription(student)}
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
          setShowWithSubscriptionOnly(false);
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title="Фильтры учеников"
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
                checked={showWithSubscriptionOnly}
                onChange={(event) => setShowWithSubscriptionOnly(event.target.checked)}
              />
            )}
            label="Только с абонементом"
          />
        </Box>
      </MobileFilterBottomSheet>

      {isBottomSheetFormEnabled ? (
        <MobileFormBottomSheet
          open={openForm}
          onClose={handleCloseForm}
          title={studentToEdit ? '✏️ Редактировать ученика' : '👤 Добавить ученика'}
        >
          <StudentForm
            initialValues={initialStudentValues}
            validationSchema={studentToEdit ? studentSchemas.update : studentSchemas.create}
            onSubmit={handleFormSubmit}
            isLoading={isCreatingStudent || isUpdatingStudent}
            onClose={handleCloseForm}
            isEdit={Boolean(studentToEdit)}
          />
        </MobileFormBottomSheet>
      ) : (
        <StudentForm
          open={openForm}
          initialValues={initialStudentValues}
          validationSchema={studentToEdit ? studentSchemas.update : studentSchemas.create}
          onSubmit={handleFormSubmit}
          isLoading={isCreatingStudent || isUpdatingStudent}
          onClose={handleCloseForm}
          isEdit={Boolean(studentToEdit)}
          title={studentToEdit ? '✏️ Редактировать ученика' : '👤 Добавить ученика'}
          subtitle="Заполните информацию об ученике"
        />
      )}

      <Dialog open={Boolean(studentToToggleStatus)} onClose={() => setStudentToToggleStatus(null)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {studentToToggleStatus?.is_active ? 'Деактивировать ученика?' : 'Активировать ученика?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {studentToToggleStatus && `${studentToToggleStatus.first_name} ${studentToToggleStatus.last_name}`}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setStudentToToggleStatus(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color={studentToToggleStatus?.is_active ? 'warning' : 'success'}
              onClick={handleConfirmToggleStatus}
            >
              {studentToToggleStatus?.is_active ? 'Деактивировать' : 'Активировать'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MobileRefreshContainer>
  );
}
