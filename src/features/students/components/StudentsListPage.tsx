import { Box } from '@mui/material';
import { UnifiedStudentsDataGrid } from './UnifiedStudentsDataGrid';

export function StudentsListPage() {
  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <UnifiedStudentsDataGrid />
    </Box>
  );
}