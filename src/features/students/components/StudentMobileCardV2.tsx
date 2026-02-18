import { Box, Chip, Paper, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import { IStudent } from '../models/student';

interface StudentMobileCardV2Props {
  student: IStudent;
  onOpen: () => void;
  hasSubscription?: boolean;
}

export function StudentMobileCardV2({ student, onOpen, hasSubscription }: StudentMobileCardV2Props) {
  const age = student.date_of_birth ? dayjs().diff(dayjs(student.date_of_birth), 'year') : null;
  const parentName = `${student.client?.first_name ?? ''} ${student.client?.last_name ?? ''}`.trim();
  const hasStudentSubscription = hasSubscription ?? Boolean(student.active_subscription_id);

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
            {student.first_name} {student.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Ученик #{student.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            color={student.is_active ? 'success' : 'default'}
            label={student.is_active ? 'Активен' : 'Неактивен'}
          />
          <ChevronRightIcon color="action" />
        </Box>
      </Box>

      <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" noWrap>
            Родитель: {parentName || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Возраст: {age ?? '—'}
          </Typography>
          <Chip
            size="small"
            label={hasStudentSubscription ? 'Есть абонемент' : 'Без абонемента'}
            variant="outlined"
            color={hasStudentSubscription ? 'success' : 'warning'}
          />
        </Box>
      </Box>
    </Paper>
  );
}
