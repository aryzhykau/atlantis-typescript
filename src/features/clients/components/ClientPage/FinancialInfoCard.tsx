import React, { useState } from "react";
import { 
    Box, 
    Button, 
    Modal, 
    Paper, 
    Typography, 
    alpha,
    Tooltip
} from "@mui/material";
import { IClientUserGet } from "../../models/client";
import { IInvoiceGet } from "../../../invoices/models/invoice";
import { AddUserPaymentForm } from "./AddUserPaymentForm";
import { useGradients } from "../../../trainer-mobile/hooks/useGradients";
import { useTheme } from "@mui/material";

// Иконки
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FinancialInfoCardProps {
    client: IClientUserGet;
    invoices: IInvoiceGet[];
    invalidateFunction: () => void;
}

interface FinancialItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
    status: 'positive' | 'negative' | 'neutral' | 'warning';
    description?: string;
}

const FinancialItem: React.FC<FinancialItemProps> = ({ icon, label, value, gradient, status, description }) => {
    const theme = useTheme();
    
    const getStatusIcon = () => {
        switch (status) {
            case 'positive':
                return <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />;
            case 'negative':
                return <WarningIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />;
            case 'warning':
                return <WarningIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
            default:
                return null;
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    background: alpha(theme.palette.primary.main, 0.02),
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        background: gradient,
                        color: 'white',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
                {getStatusIcon()}
            </Box>
            <Box sx={{ pl: 6 }}>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontWeight: 700,
                        color: status === 'positive' ? 'success.main' : 
                               status === 'negative' ? 'error.main' : 
                               status === 'warning' ? 'warning.main' : 'text.primary'
                    }}
                >
                    {value}
                </Typography>
                {description && (
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary',
                            mt: 0.5,
                            display: 'block'
                        }}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: '50%' }, 
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
};

export const FinancialInfoCard: React.FC<FinancialInfoCardProps> = ({ client, invoices, invalidateFunction}) => {
    const theme = useTheme();
    const gradients = useGradients();
    const [open, setOpen] = useState(false);

    const unpaidSumFromInvoices = invoices.reduce((acc, invoice) => {
        if (invoice.status === "UNPAID") {
            return acc + invoice.amount;
        }
        return acc;
    }, 0);

    const currentBalance = client.balance ?? 0;
    const amountToPayOff = Math.max(0, unpaidSumFromInvoices - currentBalance);
    const unpaidCount = invoices.filter(invoice => invoice.status === "UNPAID").length;

    const handleClose = () => {
        setOpen(false);
        invalidateFunction();
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: theme.palette.background.paper,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Градиентный заголовок */}
            <Box
                sx={{
                    p: 3,
                    background: gradients.success,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ fontSize: 32, mr: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Финансовая информация
                            </Typography>
                        </Box>
                        <Tooltip title="Добавить платеж">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpen(true)}
                                sx={{
                                    background: 'white',
                                    color: theme.palette.success.main,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 2,
                                    py: 1,
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.9),
                                    }
                                }}
                            >
                                Добавить платеж
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Контент карточки */}
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                    <FinancialItem
                        icon={<AccountBalanceWalletIcon />}
                        label="Текущий баланс"
                        value={`${currentBalance.toLocaleString()} €`}
                        gradient={currentBalance >= 0 ? gradients.success : gradients.warning}
                        status={currentBalance >= 0 ? 'positive' : 'negative'}
                        description={currentBalance >= 0 ? 'Положительный баланс' : 'Отрицательный баланс'}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FinancialItem
                        icon={<ReceiptLongIcon />}
                        label="Сумма к оплате"
                        value={`${unpaidSumFromInvoices.toLocaleString()} €`}
                        gradient={unpaidSumFromInvoices > 0 ? gradients.warning : gradients.info}
                        status={unpaidSumFromInvoices > 0 ? 'warning' : 'neutral'}
                        description={`${unpaidCount} неоплаченных инвойсов`}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FinancialItem
                        icon={<PaymentsIcon />}
                        label="Нужно доплатить"
                        value={`${amountToPayOff.toLocaleString()} €`}
                        gradient={amountToPayOff > 0 ? gradients.warning : gradients.success}
                        status={amountToPayOff > 0 ? 'warning' : 'positive'}
                        description={amountToPayOff > 0 ? 'Требуется дополнительная оплата' : 'Все оплачено'}
                    />
                </Box>

                <Box sx={{ mb: 'auto' }}>
                    <FinancialItem
                        icon={<ReceiptLongIcon />}
                        label="Неоплаченных инвойсов"
                        value={unpaidCount.toString()}
                        gradient={unpaidCount > 0 ? gradients.warning : gradients.success}
                        status={unpaidCount > 0 ? 'warning' : 'positive'}
                        description={unpaidCount > 0 ? 'Требуют оплаты' : 'Все инвойсы оплачены'}
                    />
                </Box>
            </Box>

            {/* Модальное окно добавления платежа */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    {/* Градиентный заголовок модального окна */}
                    <Box
                        sx={{
                            p: 3,
                            background: gradients.success,
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
                            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                💰 Добавить платеж
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                {client.first_name} {client.last_name}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Контент модального окна */}
                    <Box sx={{ p: 3 }}>
                        <AddUserPaymentForm
                            initialValues={{
                                client_id: client.id,
                                amount: unpaidSumFromInvoices > 0 ? amountToPayOff : 0,
                                description: "",
                            }}
                            client_name={`${client.first_name} ${client.last_name}`}
                            onClose={handleClose}
                        />
                    </Box>
                </Box>
            </Modal>
        </Paper>
    );
}; 