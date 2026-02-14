import { useMemo, useState } from 'react';
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
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import PercentIcon from '@mui/icons-material/Percent';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';

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
import {
  useCreateTrainerMutation,
  useGetTrainersQuery,
  useUpdateTrainerMutation,
  useUpdateTrainerStatusMutation,
} from '../../../store/apis/trainersApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { TrainerMobileCardV2 } from './TrainerMobileCardV2';
import { IStatusUpdatePayload, ITrainerCreatePayload, ITrainerResponse, ITrainerUpdatePayload } from '../models/trainer';
import { TrainerForm } from './TrainerForm';

export function MobileTrainersListPage() {
  const isBottomSheetFormEnabled = import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';
  const navigate = useNavigate();
  const gradients = useGradients();
  const { displaySnackbar } = useSnackbar();

  const { data: trainersResponse, isLoading, isError, isFetching, refetch } = useGetTrainersQuery();
  const [createTrainer, { isLoading: isCreating }] = useCreateTrainerMutation();
  const [updateTrainer, { isLoading: isUpdating }] = useUpdateTrainerMutation();
  const [updateTrainerStatus, { isLoading: isStatusUpdating }] = useUpdateTrainerStatusMutation();

  const trainers = trainersResponse?.trainers || [];

  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showOnlyFixedSalary, setShowOnlyFixedSalary] = useState(false);
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('atlantis_mobile_trainers_swipe_tip_seen') !== '1';
  });

  const [openForm, setOpenForm] = useState(false);
  const [trainerToEdit, setTrainerToEdit] = useState<ITrainerResponse | null>(null);
  const [trainerToToggleStatus, setTrainerToToggleStatus] = useState<ITrainerResponse | null>(null);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      if (showOnlyActive && !trainer.is_active) return false;
      if (showOnlyFixedSalary && !trainer.is_fixed_salary) return false;

      if (!searchValue.trim()) return true;

      const query = searchValue.toLowerCase().trim();
      const phone = `${trainer.phone_country_code ?? ''} ${trainer.phone_number ?? ''}`;
      return [
        trainer.first_name,
        trainer.last_name,
        `${trainer.first_name} ${trainer.last_name}`,
        trainer.email,
        phone,
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [trainers, searchValue, showOnlyActive, showOnlyFixedSalary]);

  const stats = useMemo(() => {
    const total = trainers.length;
    const active = trainers.filter((trainer) => trainer.is_active).length;
    const fixed = trainers.filter((trainer) => trainer.is_fixed_salary).length;
    const percent = trainers.filter((trainer) => !trainer.is_fixed_salary).length;
    return { total, active, fixed, percent };
  }, [trainers]);

  const handleOpenCreate = () => {
    setTrainerToEdit(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (trainer: ITrainerResponse) => {
    setTrainerToEdit(trainer);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setTrainerToEdit(null);
  };

  const handleCloseSwipeTip = () => {
    setShowSwipeTip(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('atlantis_mobile_trainers_swipe_tip_seen', '1');
    }
  };

  const handleFormSubmit = async (values: ITrainerCreatePayload | ITrainerUpdatePayload, id?: number) => {
    try {
      if (trainerToEdit && id) {
        await updateTrainer({ trainerId: id, trainerData: values as ITrainerUpdatePayload }).unwrap();
        displaySnackbar('Тренер обновлен', 'success');
      } else {
        await createTrainer(values as ITrainerCreatePayload).unwrap();
        displaySnackbar('Тренер создан', 'success');
      }
      handleCloseForm();
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail || (trainerToEdit ? 'Ошибка обновления тренера' : 'Ошибка создания тренера');
      displaySnackbar(errorMessage, 'error');
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!trainerToToggleStatus) return;

    const statusData: IStatusUpdatePayload = { is_active: !trainerToToggleStatus.is_active };

    try {
      await updateTrainerStatus({ trainerId: trainerToToggleStatus.id, statusData }).unwrap();
      displaySnackbar(
        trainerToToggleStatus.is_active ? 'Тренер деактивирован' : 'Тренер активирован',
        'success'
      );
      setTrainerToToggleStatus(null);
      await refetch();
    } catch {
      displaySnackbar('Ошибка обновления статуса тренера', 'error');
    }
  };

  const isOverlayOpen = openForm || filtersOpen || Boolean(trainerToToggleStatus);

  return (
    <MobileRefreshContainer
      onRefresh={refetch}
      isRefreshing={isFetching}
      disabled={isOverlayOpen}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Тренеры"
        subtitle="Мобильный список тренеров"
        icon={<FitnessCenterIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Имя, email, телефон"
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
              <MetricPillCard label="Всего" value={stats.total} gradient={gradients.primary} icon={<FitnessCenterIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Активные" value={stats.active} gradient={gradients.success} icon={<CheckCircleIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Фикс." value={stats.fixed} gradient={gradients.info} icon={<PaymentsIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Процент" value={stats.percent} gradient={gradients.warning} icon={<PercentIcon fontSize="small" />} />
            </Grid>
          </Grid>
        )}
        fab={(
          <Fab
            aria-label="add-trainer"
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
              Список тренеров
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {filteredTrainers.length}
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
          {isError && <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки тренеров.</Typography>}

          {!isLoading && !isError && filteredTrainers.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Тренеры не найдены. Измените фильтры или добавьте нового тренера.
            </Typography>
          )}

          {filteredTrainers.map((trainer) => (
            <SwipeableActionCard
              key={trainer.id}
              disabled={isOverlayOpen}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenEdit(trainer)}
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
                    onClick={() => setTrainerToToggleStatus(trainer)}
                    sx={{
                      borderRadius: 0,
                      background: trainer.is_active ? gradients.warning : gradients.success,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: trainer.is_active ? gradients.warning : gradients.success,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    {trainer.is_active ? 'Статус' : 'Актив.'}
                  </Button>
                </Stack>
              )}
              revealWidth={176}
            >
              <TrainerMobileCardV2
                trainer={trainer}
                onOpen={() => navigate(`/home/trainers/${trainer.id}`)}
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
          setShowOnlyFixedSalary(false);
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title="Фильтры тренеров"
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
                checked={showOnlyFixedSalary}
                onChange={(event) => setShowOnlyFixedSalary(event.target.checked)}
              />
            )}
            label="Только фиксированная оплата"
          />
        </Box>
      </MobileFilterBottomSheet>

      {isBottomSheetFormEnabled ? (
        <MobileFormBottomSheet
          open={openForm}
          onClose={handleCloseForm}
          title={trainerToEdit ? '✏️ Редактировать тренера' : '🏋️ Добавить тренера'}
        >
          <TrainerForm
            title={trainerToEdit ? 'Редактировать тренера' : 'Добавить тренера'}
            initialValues={trainerToEdit ?? undefined}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
            isEdit={Boolean(trainerToEdit)}
            isLoading={isCreating || isUpdating}
            useDialogContainer={false}
          />
        </MobileFormBottomSheet>
      ) : (
        <TrainerForm
          title={trainerToEdit ? 'Редактировать тренера' : 'Добавить тренера'}
          initialValues={trainerToEdit ?? undefined}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          isEdit={Boolean(trainerToEdit)}
          isLoading={isCreating || isUpdating}
          open={openForm}
        />
      )}

      <Dialog open={Boolean(trainerToToggleStatus)} onClose={() => setTrainerToToggleStatus(null)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {trainerToToggleStatus?.is_active ? 'Деактивировать тренера?' : 'Активировать тренера?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {trainerToToggleStatus && `${trainerToToggleStatus.first_name} ${trainerToToggleStatus.last_name}`}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setTrainerToToggleStatus(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color={trainerToToggleStatus?.is_active ? 'warning' : 'success'}
              onClick={handleConfirmToggleStatus}
              disabled={isStatusUpdating}
            >
              {trainerToToggleStatus?.is_active ? 'Деактивировать' : 'Активировать'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MobileRefreshContainer>
  );
}
