import { Box, Chip, Avatar, Typography } from '@mui/material';

interface Props {
  training: any;
  time?: string;
  onClick?: (ev?: any) => void;
}

export default function TrainingChip({ training, time, onClick }: Props) {
  const trainingTypeColor = training?.training_type?.color || '#1976d2';
  const title = training?.training_type?.name || training?.title || 'Тренировка';

  // Resolve trainer object / name from both templates and real trainings
  const trainerObj = training?.responsible_trainer || training?.trainer || null;

  const getInitialsFromName = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const trainerShort = trainerObj
    ? `${(trainerObj.first_name || trainerObj.firstName || trainerObj.given_name || '').charAt(0) || ''}${(trainerObj.last_name || trainerObj.lastName || trainerObj.family_name || '').charAt(0) || ''}`.toUpperCase()
    : (getInitialsFromName(training?.responsible_trainer_name || training?.trainer_name || training?.trainer_full_name) || '?');

  return (
    <Chip
      clickable
      onClick={onClick}
      avatar={<Avatar sx={{ bgcolor: trainingTypeColor, width: 30, height: 30, fontSize: '0.85rem' }}>{trainerShort}</Avatar>}
      label={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
          <Typography noWrap component="span" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</Typography>
          <Typography noWrap component="span" sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{training?.location || training?.room || ''}</Typography>
        </Box>
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.06)', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: '0.72rem', fontWeight: 700 }}>
            {time || training?.start_time || ''}
          </Box>
        </Box>
      </Box>}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        textTransform: 'none',
        mb: 1,
        background: (theme) => theme.palette.mode === 'dark' ? `${trainingTypeColor}1f` : `${trainingTypeColor}0f`,
        border: `1px solid ${trainingTypeColor}22`,
        borderRadius: 3,
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
      }}
    />
  );
}
