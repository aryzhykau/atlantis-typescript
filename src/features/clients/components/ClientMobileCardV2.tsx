import { Box, Chip, Paper, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import { IClientUserGet } from '../models/client';

interface ClientMobileCardV2Props {
  client: IClientUserGet;
  onOpen: () => void;
  studentsCount: number;
}

export function ClientMobileCardV2({ client, onOpen, studentsCount }: ClientMobileCardV2Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, cursor: 'pointer' }} onClick={onOpen}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
            {client.first_name} {client.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            ID: {client.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            color={client.is_active ? 'success' : 'default'}
            label={client.is_active ? 'Активен' : 'Неактивен'}
          />
          <ChevronRightIcon color="action" />
        </Box>
      </Box>

      <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="body2" noWrap>
            +{client.phone_country_code}{client.phone_number}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <SchoolIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Учеников: {studentsCount}
          </Typography>
          {typeof client.balance === 'number' && (
            <Chip size="small" label={`Баланс: ${client.balance.toLocaleString()} ₽`} variant="outlined" />
          )}
        </Box>
      </Box>

    </Paper>
  );
}
