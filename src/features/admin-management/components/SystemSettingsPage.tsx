import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Chip,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import { useGetSystemSettingsQuery, useUpdateSystemSettingMutation } from '../../../store/apis/subscriptionsV2Api';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';

const DEBT_BEHAVIOR_OPTIONS = [
    { value: 'HIGHLIGHT_ONLY', label: 'Только подсветка (не блокировать)' },
    { value: 'BLOCK_ACCESS', label: 'Блокировать доступ к тренировкам' },
];

export const SystemSettingsPage: React.FC = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: settings, isLoading: isLoadingSettings } = useGetSystemSettingsQuery();
    const [updateSetting, { isLoading: isSaving }] = useUpdateSystemSettingMutation();

    const [makeupWindowDays, setMakeupWindowDays] = useState<string>('7');
    const [debtBehavior, setDebtBehavior] = useState<string>('HIGHLIGHT_ONLY');
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!settings) return;
        const makeupSetting = settings.find((s) => s.key === 'makeup_window_days');
        const debtSetting = settings.find((s) => s.key === 'debt_behavior');
        if (makeupSetting) setMakeupWindowDays(makeupSetting.value);
        if (debtSetting) setDebtBehavior(debtSetting.value);
    }, [settings]);

    const isOwner = currentUser?.role === 'OWNER';

    if (!isOwner) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', maxWidth: 480, textAlign: 'center' }}
                >
                    <LockIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        Доступ запрещён
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Раздел доступен только владельцу клуба.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    const handleSave = async (key: string, value: string) => {
        setSaveSuccess(null);
        setSaveError(null);
        try {
            await updateSetting({ key, value }).unwrap();
            setSaveSuccess(`Настройка "${key}" сохранена`);
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch {
            setSaveError('Ошибка при сохранении. Попробуйте ещё раз.');
        }
    };

    if (isLoadingSettings) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h5" fontWeight={700}>
                    Настройки системы
                </Typography>
                <Chip label="Только владелец" size="small" color="warning" />
            </Stack>

            {saveSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(null)}>
                    {saveSuccess}
                </Alert>
            )}
            {saveError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
                    {saveError}
                </Alert>
            )}

            <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
            >
                {/* makeup_window_days */}
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Окно отработки (дней)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Сколько дней после пропуска ученик может записаться на отработку.
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            type="number"
                            label="Количество дней"
                            value={makeupWindowDays}
                            onChange={(e) => setMakeupWindowDays(e.target.value)}
                            inputProps={{ min: 1, max: 90 }}
                            size="small"
                            sx={{ width: 160 }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            disabled={isSaving}
                            onClick={() => handleSave('makeup_window_days', makeupWindowDays)}
                        >
                            Сохранить
                        </Button>
                    </Stack>
                </Box>

                <Divider />

                {/* debt_behavior */}
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Поведение при задолженности
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Что происходит, когда у ученика просрочен платёж по абонементу.
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 300 }}>
                            <InputLabel>Поведение</InputLabel>
                            <Select
                                value={debtBehavior}
                                label="Поведение"
                                onChange={(e) => setDebtBehavior(e.target.value)}
                            >
                                {DEBT_BEHAVIOR_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            disabled={isSaving}
                            onClick={() => handleSave('debt_behavior', debtBehavior)}
                        >
                            Сохранить
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default SystemSettingsPage;
