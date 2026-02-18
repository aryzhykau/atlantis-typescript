import { Box, Chip, Paper, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import dayjs from 'dayjs';

import { ITrainerResponse } from '../models/trainer';

interface TrainerMobileCardV2Props {
  trainer: ITrainerResponse;
  onOpen: () => void;
}

export function TrainerMobileCardV2({ trainer, onOpen }: TrainerMobileCardV2Props) {
  const age = trainer.date_of_birth ? dayjs().diff(dayjs(trainer.date_of_birth), 'year') : null;
  const phone = `${trainer.phone_country_code ?? ''} ${trainer.phone_number ?? ''}`.trim();

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        p: 2,
        transition: 'background-color 0.2s ease',
        '&:active': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, cursor: 'pointer' }}
        onClick={onOpen}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
            {trainer.first_name} {trainer.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Тренер #{trainer.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            color={trainer.is_active ? 'success' : 'default'}
            label={trainer.is_active ? 'Активен' : 'Неактивен'}
          />
          <ChevronRightIcon color="action" />
        </Box>
      </Box>

      <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" noWrap>
            {phone || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BadgeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Возраст: {age ?? '—'}
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            color={trainer.is_fixed_salary ? 'info' : 'success'}
            label={trainer.is_fixed_salary ? 'Фикс.' : 'Процент'}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WorkOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" noWrap color="text.secondary">
            {trainer.email}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
