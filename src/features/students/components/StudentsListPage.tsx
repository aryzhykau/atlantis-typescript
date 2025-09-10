import { Box } from '@mui/material';
import { UnifiedStudentsDataGrid } from './UnifiedStudentsDataGrid';

export function StudentsListPage() {
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <UnifiedStudentsDataGrid />
    </Box>
  );
}