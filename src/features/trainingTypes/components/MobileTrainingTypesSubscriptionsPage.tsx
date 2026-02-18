import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EuroIcon from '@mui/icons-material/Euro';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import useMobile from '../../../hooks/useMobile';
import {
  MetricPillCard,
  MobileCollapsibleSearch,
  MobileFilterBottomSheet,
  MobileFormBottomSheet,
  MobilePageShell,
  MobileRefreshContainer,
  SwipeableActionCard,
} from '../../../components/mobile-kit';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGetTrainingTypesQuery, useUpdateTrainingTypeMutation } from '../../../store/apis/trainingTypesApi';
import {
  useGetSubscriptionsQuery,
  useUpdateSubscriptionMutation,
} from '../../../store/apis/subscriptionsApi';
import { ITrainingType } from '../../training-types/models/trainingType';
import { ISubscriptionResponse } from '../../subscriptions/models/subscription';
import TrainingTypeForm from './TrainingTypeForm';
import SubscriptionForm from '../../subscriptions/components/SubscriptionForm';

const trainingTypeInitialValues: Partial<ITrainingType> = {
  name: '',
  price: null,
  max_participants: 4,
  color: '#FFFFFF',
  is_subscription_only: false,
  is_active: true,
};

export function MobileTrainingTypesSubscriptionsPage() {
  const gradients = useGradients();
  const { displaySnackbar } = useSnackbar();
  const isMobile = useMobile();
  const isBottomSheetFormEnabled = isMobile && import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';

  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('atlantis_mobile_training_settings_swipe_tip_seen') !== '1';
  });

  const [trainingTypesActiveOnly, setTrainingTypesActiveOnly] = useState(true);
  const [trainingTypesSubscriptionOnly, setTrainingTypesSubscriptionOnly] = useState(false);
  const [subscriptionsActiveOnly, setSubscriptionsActiveOnly] = useState(true);
  const [subscriptionsShortOnly, setSubscriptionsShortOnly] = useState(false);

  const [trainingTypeFormOpen, setTrainingTypeFormOpen] = useState(false);
  const [subscriptionFormOpen, setSubscriptionFormOpen] = useState(false);

  const [isCreatingTrainingType, setIsCreatingTrainingType] = useState(true);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(true);

  const [trainingTypeForForm, setTrainingTypeForForm] = useState<Partial<ITrainingType> | null>(null);
  const [subscriptionForForm, setSubscriptionForForm] = useState<Partial<ISubscriptionResponse> | null>(null);

  const [trainingTypeToToggleStatus, setTrainingTypeToToggleStatus] = useState<ITrainingType | null>(null);
  const [subscriptionToToggleStatus, setSubscriptionToToggleStatus] = useState<ISubscriptionResponse | null>(null);

  const {
    data: trainingTypesResponse,
    isLoading: isLoadingTrainingTypes,
    isFetching: isFetchingTrainingTypes,
    isError: isErrorTrainingTypes,
    refetch: refetchTrainingTypes,
  } = useGetTrainingTypesQuery({});

  const {
    data: subscriptionsResponse,
    isLoading: isLoadingSubscriptions,
    isFetching: isFetchingSubscriptions,
    isError: isErrorSubscriptions,
    refetch: refetchSubscriptions,
  } = useGetSubscriptionsQuery();

  const [updateTrainingType, { isLoading: isUpdatingTrainingTypeStatus }] = useUpdateTrainingTypeMutation();
  const [updateSubscription, { isLoading: isUpdatingSubscriptionRequest }] = useUpdateSubscriptionMutation();

  const trainingTypes = trainingTypesResponse || [];
  const subscriptions = subscriptionsResponse?.items || [];

  const filteredTrainingTypes = useMemo(() => {
    const query = searchValue.toLowerCase().trim();

    return trainingTypes.filter((trainingType) => {
      if (trainingTypesActiveOnly && !trainingType.is_active) return false;
      if (trainingTypesSubscriptionOnly && !trainingType.is_subscription_only) return false;

      if (!query) return true;

      return [
        trainingType.name,
        trainingType.price?.toString(),
        trainingType.max_participants?.toString(),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [trainingTypes, searchValue, trainingTypesActiveOnly, trainingTypesSubscriptionOnly]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchValue.toLowerCase().trim();

    return subscriptions.filter((subscription) => {
      if (subscriptionsActiveOnly && !subscription.is_active) return false;
      if (subscriptionsShortOnly && subscription.validity_days > 30) return false;

      if (!query) return true;

      return [
        subscription.name,
        subscription.price?.toString(),
        subscription.number_of_sessions?.toString(),
        subscription.validity_days?.toString(),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [subscriptions, searchValue, subscriptionsActiveOnly, subscriptionsShortOnly]);

  const trainingTypeStats = useMemo(() => {
    const total = trainingTypes.length;
    const active = trainingTypes.filter((item) => item.is_active).length;
    const subscriptionOnly = trainingTypes.filter((item) => item.is_subscription_only).length;
    const priced = trainingTypes.filter((item) => !item.is_subscription_only && Number(item.price || 0) > 0).length;
    return { total, active, subscriptionOnly, priced };
  }, [trainingTypes]);

  const subscriptionStats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((item) => item.is_active).length;
    const short = subscriptions.filter((item) => item.validity_days <= 30).length;
    const avgPrice = subscriptions.length
      ? Math.round(subscriptions.reduce((sum, item) => sum + (item.price || 0), 0) / subscriptions.length)
      : 0;
    return { total, active, short, avgPrice };
  }, [subscriptions]);

  const handleCloseSwipeTip = () => {
    setShowSwipeTip(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('atlantis_mobile_training_settings_swipe_tip_seen', '1');
    }
  };

  const handleOpenCreate = () => {
    if (activeTab === 0) {
      setIsCreatingTrainingType(true);
      setTrainingTypeForForm(trainingTypeInitialValues);
      setTrainingTypeFormOpen(true);
      return;
    }

    setIsCreatingSubscription(true);
    setSubscriptionForForm({
      name: '',
      price: 0,
      validity_days: 30,
      number_of_sessions: 1,
      is_active: true,
    });
    setSubscriptionFormOpen(true);
  };

  const handleOpenTrainingTypeEdit = (trainingType: ITrainingType) => {
    setIsCreatingTrainingType(false);
    setTrainingTypeForForm(trainingType);
    setTrainingTypeFormOpen(true);
  };

  const handleOpenSubscriptionEdit = (subscription: ISubscriptionResponse) => {
    setIsCreatingSubscription(false);
    setSubscriptionForForm(subscription);
    setSubscriptionFormOpen(true);
  };

  const handleToggleTrainingTypeStatus = async () => {
    if (!trainingTypeToToggleStatus) return;

    try {
      await updateTrainingType({
        id: trainingTypeToToggleStatus.id,
        payload: { is_active: !trainingTypeToToggleStatus.is_active },
      }).unwrap();
      displaySnackbar(
        trainingTypeToToggleStatus.is_active ? 'Вид тренировки деактивирован' : 'Вид тренировки активирован',
        'success',
      );
      setTrainingTypeToToggleStatus(null);
      await refetchTrainingTypes();
    } catch {
      displaySnackbar('Ошибка обновления статуса вида тренировки', 'error');
    }
  };

  const handleToggleSubscriptionStatus = async () => {
    if (!subscriptionToToggleStatus) return;

    try {
      await updateSubscription({
        id: subscriptionToToggleStatus.id,
        payload: { is_active: !subscriptionToToggleStatus.is_active },
      }).unwrap();
      displaySnackbar(
        subscriptionToToggleStatus.is_active ? 'Абонемент деактивирован' : 'Абонемент активирован',
        'success',
      );
      setSubscriptionToToggleStatus(null);
      await refetchSubscriptions();
    } catch {
      displaySnackbar('Ошибка обновления статуса абонемента', 'error');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetchTrainingTypes(), refetchSubscriptions()]);
  };

  const isOverlayOpen =
    filtersOpen ||
    trainingTypeFormOpen ||
    subscriptionFormOpen ||
    Boolean(trainingTypeToToggleStatus) ||
    Boolean(subscriptionToToggleStatus);

  return (
    <MobileRefreshContainer
      onRefresh={handleRefresh}
      isRefreshing={isFetchingTrainingTypes || isFetchingSubscriptions || isUpdatingTrainingTypeStatus || isUpdatingSubscriptionRequest}
      disabled={isOverlayOpen}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Тренировки и абонементы"
        subtitle="Мобильные настройки услуг"
        icon={<PoolIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder={activeTab === 0 ? 'Поиск вида тренировки' : 'Поиск абонемента'}
              onDarkBackground
            />
            <IconButton aria-label="open-training-subscription-filters" onClick={() => setFiltersOpen(true)}>
              <FilterListIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        )}
        stats={(
          activeTab === 0 ? (
            <Grid container spacing={1.25}>
              <Grid item xs={6}>
                <MetricPillCard label="Всего" value={trainingTypeStats.total} gradient={gradients.primary} icon={<FitnessCenterIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Активные" value={trainingTypeStats.active} gradient={gradients.success} icon={<CheckCircleIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="По абонем." value={trainingTypeStats.subscriptionOnly} gradient={gradients.info} icon={<CardMembershipIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Платные" value={trainingTypeStats.priced} gradient={gradients.warning} icon={<EuroIcon fontSize="small" />} />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={1.25}>
              <Grid item xs={6}>
                <MetricPillCard label="Всего" value={subscriptionStats.total} gradient={gradients.primary} icon={<CardMembershipIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Активные" value={subscriptionStats.active} gradient={gradients.success} icon={<CheckCircleIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="До 30 дн." value={subscriptionStats.short} gradient={gradients.info} icon={<EventAvailableIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Ср. цена" value={`${subscriptionStats.avgPrice} €`} gradient={gradients.warning} icon={<EuroIcon fontSize="small" />} />
              </Grid>
            </Grid>
          )
        )}
        fab={(
          <Fab
            aria-label="add-training-or-subscription"
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
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
          >
            <Tab label="Виды тренировок" />
            <Tab label="Абонементы" />
          </Tabs>
        </Box>

        <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {activeTab === 0 ? 'Список видов тренировок' : 'Список абонементов'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {activeTab === 0 ? filteredTrainingTypes.length : filteredSubscriptions.length}
            </Typography>
          </Box>

          {showSwipeTip && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Alert severity="info" onClose={handleCloseSwipeTip} sx={{ borderRadius: 2 }}>
                Свайп влево по карточке, чтобы открыть действия. Свайп вправо — закрыть.
              </Alert>
            </Box>
          )}

          {activeTab === 0 && isLoadingTrainingTypes && (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />
          )}
          {activeTab === 1 && isLoadingSubscriptions && (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />
          )}

          {activeTab === 0 && isErrorTrainingTypes && (
            <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки видов тренировок.</Typography>
          )}
          {activeTab === 1 && isErrorSubscriptions && (
            <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки абонементов.</Typography>
          )}

          {activeTab === 0 && !isLoadingTrainingTypes && !isErrorTrainingTypes && filteredTrainingTypes.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Виды тренировок не найдены.
            </Typography>
          )}
          {activeTab === 1 && !isLoadingSubscriptions && !isErrorSubscriptions && filteredSubscriptions.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Абонементы не найдены.
            </Typography>
          )}

          {activeTab === 0 && filteredTrainingTypes.map((item) => (
            <SwipeableActionCard
              key={item.id}
              disabled={isOverlayOpen}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenTrainingTypeEdit(item)}
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
                    onClick={() => setTrainingTypeToToggleStatus(item)}
                    sx={{
                      borderRadius: 0,
                      background: item.is_active ? gradients.warning : gradients.success,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: item.is_active ? gradients.warning : gradients.success,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    {item.is_active ? 'Архив' : 'Актив.'}
                  </Button>
                </Stack>
              )}
              revealWidth={176}
            >
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                      #{item.id}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: item.color,
                      }}
                    />
                    <Chip size="small" label={item.is_active ? 'Активен' : 'Архив'} color={item.is_active ? 'success' : 'default'} />
                  </Stack>
                </Box>

                <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.is_subscription_only ? 'Только по абонементу' : `${item.price ?? 0} €`}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Участников: {item.max_participants ?? 'без ограничений'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Режим отмены: {item.cancellation_mode === 'FIXED' ? 'Фиксированный' : 'Гибкий'}
                  </Typography>
                </Box>
              </Box>
            </SwipeableActionCard>
          ))}

          {activeTab === 1 && filteredSubscriptions.map((item) => (
            <SwipeableActionCard
              key={item.id}
              disabled={isOverlayOpen}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenSubscriptionEdit(item)}
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
                    onClick={() => setSubscriptionToToggleStatus(item)}
                    sx={{
                      borderRadius: 0,
                      background: item.is_active ? gradients.warning : gradients.success,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: item.is_active ? gradients.warning : gradients.success,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    {item.is_active ? 'Архив' : 'Актив.'}
                  </Button>
                </Stack>
              )}
              revealWidth={176}
            >
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                      #{item.id}
                    </Typography>
                  </Box>

                  <Chip size="small" label={item.is_active ? 'Активен' : 'Архив'} color={item.is_active ? 'success' : 'default'} />
                </Box>

                <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.price.toFixed(2)} €
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Занятий: {item.number_of_sessions}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Действует: {item.validity_days} дн.
                  </Typography>
                </Box>
              </Box>
            </SwipeableActionCard>
          ))}
        </Box>
      </MobilePageShell>

      <MobileFilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onReset={() => {
          setTrainingTypesActiveOnly(true);
          setTrainingTypesSubscriptionOnly(false);
          setSubscriptionsActiveOnly(true);
          setSubscriptionsShortOnly(false);
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title={activeTab === 0 ? 'Фильтры видов тренировок' : 'Фильтры абонементов'}
      >
        {activeTab === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={(
                <Switch
                  checked={trainingTypesActiveOnly}
                  onChange={(event) => setTrainingTypesActiveOnly(event.target.checked)}
                />
              )}
              label="Только активные"
            />
            <FormControlLabel
              control={(
                <Switch
                  checked={trainingTypesSubscriptionOnly}
                  onChange={(event) => setTrainingTypesSubscriptionOnly(event.target.checked)}
                />
              )}
              label="Только по абонементу"
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={(
                <Switch
                  checked={subscriptionsActiveOnly}
                  onChange={(event) => setSubscriptionsActiveOnly(event.target.checked)}
                />
              )}
              label="Только активные"
            />
            <FormControlLabel
              control={(
                <Switch
                  checked={subscriptionsShortOnly}
                  onChange={(event) => setSubscriptionsShortOnly(event.target.checked)}
                />
              )}
              label="Только до 30 дней"
            />
          </Box>
        )}
      </MobileFilterBottomSheet>

      {isBottomSheetFormEnabled ? (
        <>
          <MobileFormBottomSheet
            open={trainingTypeFormOpen}
            onClose={() => {
              setTrainingTypeFormOpen(false);
              setTrainingTypeForForm(null);
            }}
            title={isCreatingTrainingType ? '🏋️ Добавить вид тренировки' : '✏️ Редактировать вид тренировки'}
          >
            {trainingTypeForForm && (
              <TrainingTypeForm
                trainingTypeId={trainingTypeForForm.id}
                initialValues={trainingTypeForForm}
                onClose={() => {
                  setTrainingTypeFormOpen(false);
                  setTrainingTypeForForm(null);
                  void refetchTrainingTypes();
                }}
                isCreating={isCreatingTrainingType}
              />
            )}
          </MobileFormBottomSheet>

          <MobileFormBottomSheet
            open={subscriptionFormOpen}
            onClose={() => {
              setSubscriptionFormOpen(false);
              setSubscriptionForForm(null);
            }}
            title={isCreatingSubscription ? '🧾 Добавить абонемент' : '✏️ Редактировать абонемент'}
          >
            {subscriptionForForm && (
              <SubscriptionForm
                isCreating={isCreatingSubscription}
                initialValues={subscriptionForForm}
                onClose={() => {
                  setSubscriptionFormOpen(false);
                  setSubscriptionForForm(null);
                  void refetchSubscriptions();
                }}
                useDialogContainer={false}
              />
            )}
          </MobileFormBottomSheet>
        </>
      ) : (
        <>
          <Dialog
            open={trainingTypeFormOpen}
            onClose={() => {
              setTrainingTypeFormOpen(false);
              setTrainingTypeForForm(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
              {trainingTypeForForm && (
                <TrainingTypeForm
                  trainingTypeId={trainingTypeForForm.id}
                  initialValues={trainingTypeForForm}
                  onClose={() => {
                    setTrainingTypeFormOpen(false);
                    setTrainingTypeForForm(null);
                    void refetchTrainingTypes();
                  }}
                  isCreating={isCreatingTrainingType}
                />
              )}
            </DialogContent>
          </Dialog>

          <SubscriptionForm
            isCreating={isCreatingSubscription}
            initialValues={subscriptionForForm || {}}
            onClose={() => {
              setSubscriptionFormOpen(false);
              setSubscriptionForForm(null);
              void refetchSubscriptions();
            }}
            open={subscriptionFormOpen}
          />
        </>
      )}

      <Dialog
        open={Boolean(trainingTypeToToggleStatus)}
        onClose={() => setTrainingTypeToToggleStatus(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {trainingTypeToToggleStatus?.is_active ? 'Архивировать вид тренировки?' : 'Активировать вид тренировки?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {trainingTypeToToggleStatus?.name}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setTrainingTypeToToggleStatus(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color={trainingTypeToToggleStatus?.is_active ? 'warning' : 'success'}
              onClick={handleToggleTrainingTypeStatus}
              disabled={isUpdatingTrainingTypeStatus}
              startIcon={trainingTypeToToggleStatus?.is_active ? <ToggleOffIcon /> : <CheckCircleIcon />}
            >
              {trainingTypeToToggleStatus?.is_active ? 'В архив' : 'Активировать'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(subscriptionToToggleStatus)}
        onClose={() => setSubscriptionToToggleStatus(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {subscriptionToToggleStatus?.is_active ? 'Архивировать абонемент?' : 'Активировать абонемент?'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subscriptionToToggleStatus?.name}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setSubscriptionToToggleStatus(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color={subscriptionToToggleStatus?.is_active ? 'warning' : 'success'}
              onClick={handleToggleSubscriptionStatus}
              disabled={isUpdatingSubscriptionRequest}
              startIcon={subscriptionToToggleStatus?.is_active ? <ToggleOffIcon /> : <CheckCircleIcon />}
            >
              {subscriptionToToggleStatus?.is_active ? 'В архив' : 'Активировать'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MobileRefreshContainer>
  );
}
