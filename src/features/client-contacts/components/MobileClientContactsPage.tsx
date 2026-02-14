import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import FilterListIcon from '@mui/icons-material/FilterList';
import PhoneIcon from '@mui/icons-material/Phone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import {
  MetricPillCard,
  MobileCollapsibleSearch,
  MobileFilterBottomSheet,
  MobilePageShell,
  MobileRefreshContainer,
  SwipeableActionCard,
} from '../../../components/mobile-kit';
import {
  ClientContactReason,
  ClientContactTask,
  useListClientContactsQuery,
  useUpdateClientContactMutation,
} from '../../../store/apis/clientContactsApi';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';

const normalizePhoneForTel = (countryCode?: string | null, phoneNumber?: string | null): string => {
  const raw = `${countryCode ?? ''}${phoneNumber ?? ''}`;
  const cleaned = raw.replace(/[^\d+]/g, '');

  if (!cleaned) return '';
  if (cleaned.startsWith('+')) {
    return `+${cleaned.slice(1).replace(/\D/g, '')}`;
  }

  return `+${cleaned.replace(/\D/g, '')}`;
};

export function MobileClientContactsPage() {
  const gradients = useGradients();
  const navigate = useNavigate();
  const { displaySnackbar } = useSnackbar();

  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [reasonFilter, setReasonFilter] = useState<'ALL' | ClientContactReason>('ALL');
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('atlantis_mobile_client_contacts_swipe_tip_seen') !== '1';
  });

  const queryParams = useMemo(() => ({
    status: showAllStatuses ? undefined : 'PENDING' as const,
    reason: reasonFilter === 'ALL' ? undefined : reasonFilter,
  }), [showAllStatuses, reasonFilter]);

  const { data: contacts = [], isLoading, isError, isFetching, refetch } = useListClientContactsQuery(queryParams);
  const { data: clients = [] } = useGetClientsQuery();
  const [updateClientContact, { isLoading: isUpdating }] = useUpdateClientContactMutation();

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const filteredContacts = useMemo(() => {
    if (!searchValue.trim()) return contacts;

    const query = searchValue.trim().toLowerCase();
    return contacts.filter((contact) => {
      const client = clientMap.get(contact.client_id);
      const clientFullName = `${client?.first_name ?? ''} ${client?.last_name ?? ''}`.trim();
      const phone = client ? `${client.phone_country_code} ${client.phone_number}` : '';

      return [
        contact.id.toString(),
        contact.reason,
        contact.status,
        contact.note,
        client?.first_name,
        client?.last_name,
        clientFullName,
        phone,
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [contacts, clientMap, searchValue]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const pending = contacts.filter((task) => task.status === 'PENDING').length;
    const done = contacts.filter((task) => task.status === 'DONE').length;
    const newClients = contacts.filter((task) => task.reason === 'NEW_CLIENT').length;
    return { total, pending, done, newClients };
  }, [contacts]);

  const handleCloseSwipeTip = () => {
    setShowSwipeTip(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('atlantis_mobile_client_contacts_swipe_tip_seen', '1');
    }
  };

  const handleMarkDone = async (task: ClientContactTask) => {
    if (task.status === 'DONE') return;

    try {
      await updateClientContact({
        task_id: task.id,
        data: { status: 'DONE' },
      }).unwrap();
      displaySnackbar('Контакт отмечен как выполненный', 'success');
      refetch();
    } catch {
      displaySnackbar('Не удалось обновить статус контакта', 'error');
    }
  };

  const getReasonMeta = (reason: ClientContactReason) => {
    if (reason === 'NEW_CLIENT') {
      return { label: 'Новый клиент', icon: <PersonAddIcon sx={{ fontSize: 15, color: 'success.main' }} /> };
    }
    return { label: 'Вернувшийся', icon: <RefreshIcon sx={{ fontSize: 15, color: 'info.main' }} /> };
  };

  return (
    <MobileRefreshContainer
      onRefresh={refetch}
      isRefreshing={isFetching}
      disabled={filtersOpen || isUpdating}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Контакты клиентов"
        subtitle="Очередь звонков и возвратов"
        icon={<ContactPhoneIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Имя, телефон, заметка"
              onDarkBackground
            />
            <IconButton aria-label="open-contact-filters" onClick={() => setFiltersOpen(true)}>
              <FilterListIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        )}
        stats={(
          <Grid container spacing={1.25}>
            <Grid item xs={6}>
              <MetricPillCard label="Всего" value={stats.total} gradient={gradients.primary} icon={<ContactPhoneIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="В ожидании" value={stats.pending} gradient={gradients.warning} icon={<PhoneIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Выполнено" value={stats.done} gradient={gradients.success} icon={<DoneAllIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Новые" value={stats.newClients} gradient={gradients.info} icon={<PersonAddIcon fontSize="small" />} />
            </Grid>
          </Grid>
        )}
      >
        <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Список контактов
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {filteredContacts.length}
            </Typography>
          </Box>

          {showSwipeTip && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Alert severity="info" onClose={handleCloseSwipeTip} sx={{ borderRadius: 2 }}>
                Свайп влево по карточке, чтобы открыть действия.
              </Alert>
            </Box>
          )}

          {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />}
          {isError && <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки контактов.</Typography>}

          {!isLoading && !isError && filteredContacts.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Контакты не найдены. Измените фильтры или проверьте поиск.
            </Typography>
          )}

          {filteredContacts.map((contact) => {
            const client = clientMap.get(contact.client_id);
            const reasonMeta = getReasonMeta(contact.reason);
            const clientName = client ? `${client.first_name} ${client.last_name}` : `Клиент #${contact.client_id}`;
            const phone = normalizePhoneForTel(client?.phone_country_code, client?.phone_number);

            return (
              <SwipeableActionCard
                key={contact.id}
                revealContent={(
                  <Stack direction="row" sx={{ width: '100%' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        if (!phone) {
                          displaySnackbar('У клиента нет телефона', 'warning');
                          return;
                        }
                        window.location.href = `tel:${phone}`;
                      }}
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
                      Позвонить
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleMarkDone(contact)}
                      disabled={contact.status === 'DONE'}
                      sx={{
                        borderRadius: 0,
                        background: gradients.success,
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': {
                          background: gradients.success,
                          filter: 'brightness(0.95)',
                        },
                      }}
                    >
                      Выполнено
                    </Button>
                  </Stack>
                )}
                revealWidth={230}
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
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, cursor: 'pointer' }}
                    onClick={() => navigate(`/home/clients/${contact.client_id}`)}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                        {clientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Задача #{contact.id}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      color={contact.status === 'PENDING' ? 'warning' : 'success'}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      {contact.status === 'PENDING' ? 'В ожидании' : 'Выполнено'}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {reasonMeta.icon}
                      <Typography variant="body2" color="text.secondary">
                        {reasonMeta.label}
                      </Typography>
                    </Box>

                    <Typography variant="body2" noWrap>
                      Телефон: {phone || '—'}
                    </Typography>

                    {contact.note && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Заметка: {contact.note}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.disabled">
                      Создано: {dayjs(contact.created_at).format('DD.MM.YYYY HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </SwipeableActionCard>
            );
          })}
        </Box>
      </MobilePageShell>

      <MobileFilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onReset={() => {
          setShowAllStatuses(false);
          setReasonFilter('ALL');
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title="Фильтры контактов"
      >
        <Stack spacing={1.5}>
          <FormControlLabel
            control={(
              <Switch
                checked={showAllStatuses}
                onChange={(event) => setShowAllStatuses(event.target.checked)}
              />
            )}
            label="Показывать выполненные"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Причина
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant={reasonFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setReasonFilter('ALL')}
            >
              Все
            </Button>
            <Button
              size="small"
              variant={reasonFilter === 'NEW_CLIENT' ? 'contained' : 'outlined'}
              onClick={() => setReasonFilter('NEW_CLIENT')}
            >
              Новый
            </Button>
            <Button
              size="small"
              variant={reasonFilter === 'RETURNED' ? 'contained' : 'outlined'}
              onClick={() => setReasonFilter('RETURNED')}
            >
              Вернувшийся
            </Button>
          </Stack>
        </Stack>
      </MobileFilterBottomSheet>
    </MobileRefreshContainer>
  );
}
