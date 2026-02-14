import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaymentsIcon from '@mui/icons-material/Payments';
import CancelIcon from '@mui/icons-material/Cancel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import dayjs from 'dayjs';

import {
  MetricPillCard,
  MobileCollapsibleSearch,
  MobileFilterBottomSheet,
  MobilePageShell,
  MobileRefreshContainer,
  SwipeableActionCard,
} from '../../../components/mobile-kit';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { InvoiceStatus } from '../models/invoice';
import { useCancelInvoiceMutation, useGetInvoicesQuery } from '../../../store/apis/invoices';
import { useGetPaymentHistoryQuery } from '../../../store/apis/paymentsApi';

export function MobileInvoicesPaymentsPage() {
  const gradients = useGradients();
  const { displaySnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [paymentOperationType, setPaymentOperationType] = useState<'ALL' | 'PAYMENT' | 'CANCELLATION' | 'INVOICE_PAYMENT'>('ALL');
  const [paymentsOnlyPositive, setPaymentsOnlyPositive] = useState(false);

  const [invoiceToCancel, setInvoiceToCancel] = useState<{ invoiceId: number } | null>(null);

  const invoiceStatusApiFilter = invoiceStatusFilter === 'ALL' ? undefined : invoiceStatusFilter;
  const paymentsOperationApiFilter = paymentOperationType === 'ALL' ? undefined : paymentOperationType;

  const {
    data: invoicesResponse,
    isLoading: isLoadingInvoices,
    isFetching: isFetchingInvoices,
    isError: isErrorInvoices,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery({ status: invoiceStatusApiFilter });

  const {
    data: paymentsHistoryResponse,
    isLoading: isLoadingPayments,
    isFetching: isFetchingPayments,
    isError: isErrorPayments,
    refetch: refetchPayments,
  } = useGetPaymentHistoryQuery({
    skip: 0,
    limit: 100,
    operation_type: paymentsOperationApiFilter,
  });

  const [cancelInvoice, { isLoading: isCancellingInvoice }] = useCancelInvoiceMutation();

  const invoices = invoicesResponse?.items || [];
  const paymentHistory = paymentsHistoryResponse?.items || [];

  const filteredInvoices = useMemo(() => {
    if (!searchValue.trim()) return invoices;
    const query = searchValue.toLowerCase().trim();

    return invoices.filter((invoice) => {
      const clientName = invoice.client ? `${invoice.client.first_name} ${invoice.client.last_name}` : '';
      return [
        invoice.id.toString(),
        clientName,
        invoice.description,
        invoice.status,
        invoice.type,
        invoice.amount.toString(),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [invoices, searchValue]);

  const filteredPaymentHistory = useMemo(() => {
    const source = paymentsOnlyPositive
      ? paymentHistory.filter((item) => item.amount > 0)
      : paymentHistory;

    if (!searchValue.trim()) return source;
    const query = searchValue.toLowerCase().trim();

    return source.filter((item) => {
      const clientName = `${item.client_first_name} ${item.client_last_name}`;
      const creatorName = `${item.created_by_first_name} ${item.created_by_last_name}`;
      return [
        item.id.toString(),
        clientName,
        creatorName,
        item.operation_type,
        item.description,
        item.payment_description,
        item.amount.toString(),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [paymentHistory, searchValue, paymentsOnlyPositive]);

  const invoiceStats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((invoice) => invoice.status === 'PAID' || invoice.paid_at).length;
    const unpaid = invoices.filter((invoice) => invoice.status === 'UNPAID' || invoice.status === 'PENDING').length;
    const cancelled = invoices.filter((invoice) => invoice.status === 'CANCELLED').length;
    return { total, paid, unpaid, cancelled };
  }, [invoices]);

  const paymentStats = useMemo(() => {
    const total = paymentHistory.length;
    const paymentOps = paymentHistory.filter((item) => item.operation_type === 'PAYMENT').length;
    const cancelOps = paymentHistory.filter((item) => item.operation_type === 'CANCELLATION').length;
    const totalAmount = paymentHistory.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { total, paymentOps, cancelOps, totalAmount };
  }, [paymentHistory]);

  const isOverlayOpen = filtersOpen || Boolean(invoiceToCancel);

  const handleRefresh = async () => {
    await Promise.all([refetchInvoices(), refetchPayments()]);
  };

  const statusMeta = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return { label: 'Оплачен', color: 'success' as const };
      case 'CANCELLED':
        return { label: 'Отменен', color: 'error' as const };
      case 'PENDING':
        return { label: 'В ожидании', color: 'default' as const };
      default:
        return { label: 'Не оплачен', color: 'warning' as const };
    }
  };

  return (
    <MobileRefreshContainer
      onRefresh={handleRefresh}
      isRefreshing={isFetchingInvoices || isFetchingPayments || isCancellingInvoice}
      disabled={isOverlayOpen}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Инвойсы и платежи"
        subtitle="Мобильный операционный обзор"
        icon={<ReceiptLongIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder={activeTab === 0 ? 'Поиск инвойса' : 'Поиск платежа'}
              onDarkBackground
            />
            <IconButton aria-label="open-invoice-payment-filters" onClick={() => setFiltersOpen(true)}>
              <FilterListIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        )}
        stats={(
          activeTab === 0 ? (
            <Grid container spacing={1.25}>
              <Grid item xs={6}>
                <MetricPillCard label="Всего" value={invoiceStats.total} gradient={gradients.primary} icon={<ReceiptLongIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Оплачено" value={invoiceStats.paid} gradient={gradients.success} icon={<PaymentsIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Не оплачено" value={invoiceStats.unpaid} gradient={gradients.warning} icon={<AccountBalanceWalletIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Отменено" value={invoiceStats.cancelled} gradient={gradients.info} icon={<CancelIcon fontSize="small" />} />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={1.25}>
              <Grid item xs={6}>
                <MetricPillCard label="Операций" value={paymentStats.total} gradient={gradients.primary} icon={<TrendingUpIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Платежи" value={paymentStats.paymentOps} gradient={gradients.success} icon={<PaymentsIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Отмены" value={paymentStats.cancelOps} gradient={gradients.warning} icon={<CancelIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricPillCard label="Сумма" value={`${paymentStats.totalAmount.toFixed(0)} €`} gradient={gradients.info} icon={<MonetizationOnIcon fontSize="small" />} />
              </Grid>
            </Grid>
          )
        )}
      >
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
          >
            <Tab label="Инвойсы" />
            <Tab label="Транзакции" />
          </Tabs>
        </Box>

        <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {activeTab === 0 ? 'Список инвойсов' : 'История операций'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {activeTab === 0 ? filteredInvoices.length : filteredPaymentHistory.length}
            </Typography>
          </Box>

          {activeTab === 0 && isLoadingInvoices && (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />
          )}
          {activeTab === 1 && isLoadingPayments && (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />
          )}

          {activeTab === 0 && isErrorInvoices && (
            <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки инвойсов.</Typography>
          )}
          {activeTab === 1 && isErrorPayments && (
            <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки транзакций.</Typography>
          )}

          {activeTab === 0 && !isLoadingInvoices && !isErrorInvoices && filteredInvoices.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Инвойсы не найдены.
            </Typography>
          )}

          {activeTab === 1 && !isLoadingPayments && !isErrorPayments && filteredPaymentHistory.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Транзакции не найдены.
            </Typography>
          )}

          {activeTab === 0 && filteredInvoices.map((invoice) => {
            const meta = statusMeta(invoice.status);
            const canCancelInvoice = invoice.status !== 'CANCELLED';

            return (
              <SwipeableActionCard
                key={invoice.id}
                disabled={isOverlayOpen}
                revealContent={(
                  <Stack direction="row" sx={{ width: '100%' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!canCancelInvoice}
                      onClick={() => {
                        setInvoiceToCancel({ invoiceId: invoice.id });
                      }}
                      sx={{
                        borderRadius: 0,
                        background: gradients.warning,
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': { background: gradients.warning, filter: 'brightness(0.95)' },
                      }}
                    >
                      Отменить
                    </Button>
                  </Stack>
                )}
                revealWidth={128}
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
                        Инвойс #{invoice.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                        {invoice.client ? `${invoice.client.first_name} ${invoice.client.last_name}` : 'Клиент не указан'}
                      </Typography>
                    </Box>

                    <Chip size="small" label={meta.label} color={meta.color} />
                  </Box>

                  <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {invoice.amount.toFixed(2)} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {invoice.description || 'Без описания'}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Создан: {dayjs(invoice.created_at).format('DD.MM.YYYY HH:mm')}
                    </Typography>
                    {invoice.paid_at && (
                      <Typography variant="caption" color="text.disabled">
                        Оплачен: {dayjs(invoice.paid_at).format('DD.MM.YYYY HH:mm')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </SwipeableActionCard>
            );
          })}

          {activeTab === 1 && filteredPaymentHistory.map((item) => (
            <Box
              key={item.id}
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
                    Операция #{item.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                    {item.client_first_name} {item.client_last_name}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={item.operation_type}
                  color={item.operation_type === 'CANCELLATION' ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.amount.toFixed(2)} €
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.description || item.payment_description || 'Без описания'}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {dayjs(item.created_at).format('DD.MM.YYYY HH:mm')} • {item.created_by_first_name} {item.created_by_last_name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </MobilePageShell>

      <MobileFilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onReset={() => {
          if (activeTab === 0) {
            setInvoiceStatusFilter('ALL');
          } else {
            setPaymentOperationType('ALL');
            setPaymentsOnlyPositive(false);
          }
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title={activeTab === 0 ? 'Фильтры инвойсов' : 'Фильтры транзакций'}
      >
        {activeTab === 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button size="small" variant={invoiceStatusFilter === 'ALL' ? 'contained' : 'outlined'} onClick={() => setInvoiceStatusFilter('ALL')}>
              Все
            </Button>
            <Button size="small" variant={invoiceStatusFilter === 'UNPAID' ? 'contained' : 'outlined'} onClick={() => setInvoiceStatusFilter('UNPAID')}>
              Неопл.
            </Button>
            <Button size="small" variant={invoiceStatusFilter === 'PAID' ? 'contained' : 'outlined'} onClick={() => setInvoiceStatusFilter('PAID')}>
              Опл.
            </Button>
            <Button size="small" variant={invoiceStatusFilter === 'CANCELLED' ? 'contained' : 'outlined'} onClick={() => setInvoiceStatusFilter('CANCELLED')}>
              Отм.
            </Button>
            <Button size="small" variant={invoiceStatusFilter === 'PENDING' ? 'contained' : 'outlined'} onClick={() => setInvoiceStatusFilter('PENDING')}>
              Ожид.
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" variant={paymentOperationType === 'ALL' ? 'contained' : 'outlined'} onClick={() => setPaymentOperationType('ALL')}>
                Все
              </Button>
              <Button size="small" variant={paymentOperationType === 'PAYMENT' ? 'contained' : 'outlined'} onClick={() => setPaymentOperationType('PAYMENT')}>
                Платеж
              </Button>
              <Button size="small" variant={paymentOperationType === 'CANCELLATION' ? 'contained' : 'outlined'} onClick={() => setPaymentOperationType('CANCELLATION')}>
                Отмена
              </Button>
              <Button size="small" variant={paymentOperationType === 'INVOICE_PAYMENT' ? 'contained' : 'outlined'} onClick={() => setPaymentOperationType('INVOICE_PAYMENT')}>
                Инвойс
              </Button>
            </Stack>

            <FormControlLabel
              control={(
                <Switch
                  checked={paymentsOnlyPositive}
                  onChange={(event) => setPaymentsOnlyPositive(event.target.checked)}
                />
              )}
              label="Только положительные суммы"
            />
          </Stack>
        )}
      </MobileFilterBottomSheet>

      <Dialog
        open={Boolean(invoiceToCancel)}
        onClose={() => setInvoiceToCancel(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Отменить инвойс?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Инвойс #{invoiceToCancel?.invoiceId}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setInvoiceToCancel(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={async () => {
                if (!invoiceToCancel) return;
                try {
                  await cancelInvoice({ invoiceId: invoiceToCancel.invoiceId }).unwrap();
                  displaySnackbar('Инвойс отменен', 'success');
                  setInvoiceToCancel(null);
                  await handleRefresh();
                } catch {
                  displaySnackbar('Ошибка при отмене инвойса', 'error');
                }
              }}
              disabled={isCancellingInvoice}
            >
              Подтвердить
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </MobileRefreshContainer>
  );
}
