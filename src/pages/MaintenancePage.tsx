import { Box, Typography, Paper } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

export function MaintenancePage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    maxWidth: 480,
                }}
            >
                <BuildIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Технические работы
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Atlantis временно недоступен. Мы обновляем систему. Пожалуйста, зайдите позже.
                </Typography>
            </Paper>
        </Box>
    );
}
