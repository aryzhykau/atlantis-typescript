import React from 'react';
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import dayjs from 'dayjs';
import { IMissedSession } from '../../subscriptions/models/subscription_v2';
import { useGetMissedSessionsQuery, useExcuseMissedSessionMutation } from '../../../store/apis/subscriptionsV2Api';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';

interface MissedSessionsTableProps {
    studentId: number;
}

export const MissedSessionsTable: React.FC<MissedSessionsTableProps> = ({ studentId }) => {
    const theme = useTheme();
    const { displaySnackbar } = useSnackbar();
    const { data: currentUser } = useGetCurrentUserQuery(undefined, { skip: false });

    const canExcuse = ['ADMIN', 'TRAINER', 'OWNER'].includes(currentUser?.role ?? '');

    const {
        data: missedSessions,
        isLoading,
        isError,
    } = useGetMissedSessionsQuery({ studentId });

    const [excuseMissedSession, { isLoading: isExcusing }] = useExcuseMissedSessionMutation();

    const handleExcuse = async (session: IMissedSession) => {
        try {
            await excuseMissedSession({ id: session.id }).unwrap();
            displaySnackbar('Пропуск отмечен как уважительный', 'success');
        } catch (err: any) {
            const detail = err?.data?.detail || 'Ошибка при обновлении пропуска';
            displaySnackbar(detail, 'error');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (isError) {
        return (
            <Typography variant="body2" color="error" sx={{ p: 2 }}>
                Ошибка загрузки пропусков.
            </Typography>
        );
    }

    if (!missedSessions?.items || missedSessions.items.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                Нет зафиксированных пропусков.
            </Typography>
        );
    }

    const getStatusChip = (session: IMissedSession) => {
        if (session.made_up_at) {
            return <Chip label="Отработано" color="success" size="small" />;
        }
        if (session.is_excused) {
            const deadline = session.makeup_deadline_date;
            const isOverdue = deadline && dayjs(deadline).isBefore(dayjs(), 'day');
            return (
                <Chip
                    label={isOverdue ? `Срок истёк ${dayjs(deadline).format('DD.MM')}` : `До ${dayjs(deadline).format('DD.MM')}`}
                    color={isOverdue ? 'error' : 'warning'}
                    size="small"
                />
            );
        }
        return <Chip label="Не уважительный" color="default" size="small" variant="outlined" />;
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Дата тренировки</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Тип</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                        {canExcuse && <TableCell sx={{ fontWeight: 700 }}>Действия</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {missedSessions.items.map((session) => (
                        <TableRow key={session.id} hover>
                            <TableCell>
                                {session.training_date
                                    ? dayjs(session.training_date).format('DD.MM.YYYY')
                                    : `Пропуск #${session.id}`}
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {session.training_type_name ?? '—'}
                                </Typography>
                            </TableCell>
                            <TableCell>{getStatusChip(session)}</TableCell>
                            {canExcuse && (
                                <TableCell>
                                    {!session.is_excused && !session.made_up_at && (
                                        <Tooltip title="Отметить как уважительный пропуск">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleExcuse(session)}
                                                    disabled={isExcusing}
                                                >
                                                    <CheckCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                    {session.is_excused && !session.made_up_at && (
                                        <Tooltip title={`Уважительный. Отработать до ${session.makeup_deadline_date ? dayjs(session.makeup_deadline_date).format('DD.MM.YYYY') : '—'}`}>
                                            <HelpOutlineIcon fontSize="small" color="action" />
                                        </Tooltip>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
