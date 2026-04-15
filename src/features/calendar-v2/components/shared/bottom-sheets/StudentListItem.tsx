import React from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import { PersonRemove as CancelIcon, PersonOff as MarkAbsentIcon, Cake as CakeIcon } from '@mui/icons-material';
import { isBirthday } from '../../../utils/birthdayUtils';

interface Props {
  studentTraining: any;
  typeColor: string;
  showCancel?: boolean;
  showMarkAbsent?: boolean;
  onCancel?: (student: any) => void;
  onMarkAbsent?: (studentTrainingId: string) => void;
}

const StudentListItem: React.FC<Props> = ({ studentTraining, typeColor, showCancel, showMarkAbsent, onCancel, onMarkAbsent }) => {
  const student = studentTraining.student || {};
  const initials = ((student.first_name || '?').charAt(0) + (student.last_name || '').charAt(0)).toUpperCase();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Avatar sx={{ width: 40, height: 40, fontSize: '0.9rem', backgroundColor: `${typeColor}20`, color: typeColor, fontWeight: 600, border: `2px solid ${typeColor}30` }}>{initials}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{student.first_name || 'Имя'} {student.last_name || 'Фамилия'}</Typography>
          {isBirthday(student.date_of_birth) && (
            <Tooltip title="День рождения! 🎂">
              <CakeIcon fontSize="small" sx={{ color: '#e91e63' }} />
            </Tooltip>
          )}
        </Box>
        {studentTraining.status && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{studentTraining.status}</Typography>
        )}
      </Box>

      {showMarkAbsent && (
        <IconButton size="small" onClick={() => onMarkAbsent?.(studentTraining.id)} aria-label="mark-absent">
          <MarkAbsentIcon fontSize="small" />
        </IconButton>
      )}

      {showCancel && (
        <IconButton size="small" onClick={() => onCancel?.(studentTraining)} aria-label="cancel-student">
          <CancelIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default StudentListItem;
