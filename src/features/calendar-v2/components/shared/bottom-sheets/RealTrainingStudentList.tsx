import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import StudentListItem from './StudentListItem';

interface Props {
  students: any[];
  typeColor: string;
  title?: string;
  showCancelForAdmin?: boolean; // show cancel button when true (admin/owner view)
  showMarkAbsentForTrainer?: boolean; // show mark-absent for trainer view
  onCancel?: (student: any) => void;
  onMarkAbsent?: (studentTrainingId: string) => void;
}

/**
 * RealTrainingStudentList - thin wrapper that renders `StudentListItem` for real trainings
 * Keeps the list markup simple and exposes only the actions RealTrainingView needs.
 */
const RealTrainingStudentList: React.FC<Props> = ({
  students,
  typeColor,
  title = 'Участники',
  showCancelForAdmin = false,
  showMarkAbsentForTrainer = false,
  onCancel,
  onMarkAbsent,
}) => {
  const theme = useTheme();

  if (!students || students.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.secondary,
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {title} ({students.length})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {students.map((st: any) => (
          <StudentListItem
            key={st.id}
            studentTraining={st}
            typeColor={typeColor}
            showCancel={showCancelForAdmin && st.status === 'REGISTERED'}
            showMarkAbsent={showMarkAbsentForTrainer && (st.status === 'REGISTERED' || st.status === 'PRESENT')}
            onCancel={onCancel}
            onMarkAbsent={onMarkAbsent}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RealTrainingStudentList;
