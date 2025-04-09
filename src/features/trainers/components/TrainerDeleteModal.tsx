import {
    Box,
    Button,
    Divider,
    Typography,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    useTheme
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useState } from "react";

export function TrainerDeleteModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const theme = useTheme();
    const [isChecked, setIsChecked] = useState(false);

    return (
        <Box
            sx={{
                p: 4,
                textAlign: "center",
            }}
        >
            {/* Верхнее предупреждение */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                <WarningAmberIcon sx={{ color: theme.palette.error.main, fontSize: "36px", mr: 1 }} />
                <Typography variant="h5" color="error" fontWeight="bold">
                    Внимание!
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Описание */}
            <Typography variant="body1" sx={{ mb: 3 }}>
                Удаление тренера является <strong style={{ color: theme.palette.error.main }}>необратимым</strong> действием.
            </Typography>
            <Box
                sx={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.primary.main}`,
                    padding: 2,
                    mb: 2,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Typography variant="body2" sx={{ mb: 1 }}>
                    Вместе с данными о тренере будут удалены все записи о:
                </Typography>
                <List>
                    {[
                        "Связанных платежах",
                        "Тренировках",
                        "Связанной статистике",
                    ].map((text, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemIcon sx={{ minWidth: "unset", mr: 1 }}>
                                <CircleIcon sx={{ fontSize: "8px", color: theme.palette.error.main }} />
                            </ListItemIcon>
                            <Typography variant="body2" color="text.primary">
                                {text}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    В результате удаления тренера, при наличии у него тренировок с клиентами и зарплаты платежей, информация и статистика о расходах может быть{" "}
                    <strong style={{ color: theme.palette.warning.main }}>недостоверной</strong>.
                </Typography>
            </Box>

            {/* Рекомендация */}
            <Typography variant="caption" color="warning" display="block" fontStyle="italic" sx={{ mb: 3 }}>
                Рекомендуется деактивировать тренеров. Используйте удаление только в крайних случаях.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Вопрос */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Вы уверены, что хотите удалить этого тренера?
                </Typography>
            </Box>

            {/* Подтверждение чекбокс */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                }}
            >
                <Checkbox
                    onChange={(e) => setIsChecked(e.target.checked)}
                    checked={isChecked}
                    size="small"
                    sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Я ознакомился с предупреждением и осознаю последствия
                </Typography>
            </Box>

            {/* Действия (кнопки) */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={!isChecked}
                    sx={{ flex: 1, mr: 1, p: 1.5 }}
                >
                    Удалить
                </Button>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{ flex: 1, p: 1.5 }}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
}