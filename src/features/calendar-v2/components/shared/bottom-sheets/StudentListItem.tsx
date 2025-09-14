import React from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { PersonRemove as CancelIcon, PersonOff as MarkAbsentIcon } from '@mui/icons-material';

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
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{student.first_name || 'Имя'} {student.last_name || 'Фамилия'}</Typography>
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
