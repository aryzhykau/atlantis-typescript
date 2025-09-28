import React, { useState, useMemo } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment, 
  alpha, 
  FormControlLabel, 
  Switch,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../../../hooks/useSnackBar';

import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedStudentColumns } from '../tables/enhancedStudentsColumns';
import { useGetStudentsQuery, useCreateStudentMutation } from '../../../store/apis/studentsApi';
import { StudentForm } from './StudentForm';
import { IStudentCreatePayload, IStudentUpdatePayload } from '../models/student';
import { studentSchemas } from '../../../utils/validationSchemas';

export const UnifiedStudentsDataGrid: React.FC = () => {
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
  
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { displaySnackbar } = useSnackbar();
  
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const students = studentsResponse || [];

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    // Apply active filter
    if (showOnlyActive) {
      filtered = filtered.filter(student => student.is_active);
    }

    // Apply search filter
    if (searchValue.trim() !== '') {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(student =>
        [
          student.first_name,
          student.last_name,
          student.client?.email,
          `${student.first_name} ${student.last_name}`,
          student.client?.first_name,
          student.client?.last_name,
          `${student.client?.first_name} ${student.client?.last_name}`,
          student.client?.phone || 
          (student.client?.phone_country_code && student.client?.phone_number ? 
            `${student.client.phone_country_code} ${student.client.phone_number}` : ''),
          student.client?.phone_number
        ].some(field => field?.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [students, showOnlyActive, searchValue]);

  const handleCreateBtnClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyActive(event.target.checked);
  };

  const handleCreateStudent = async (values: IStudentCreatePayload | IStudentUpdatePayload) => {
    try {
      // When called from create flow we expect a create payload; coerce if necessary
      const payload = values as IStudentCreatePayload;
      await createStudent(payload).unwrap();
      displaySnackbar('Ученик успешно создан!', 'success');
      handleCloseModal();
    } catch (error) {
      displaySnackbar('Ошибка при создании ученика', 'error');
      console.error("Failed to create student:", error);
    }
  };

  const columns = createEnhancedStudentColumns();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with filters */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: gradients.primary,
          color: 'white',
          mb: 3,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
          boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.25)' : '0 2px 8px 0 rgba(80,0,120,0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: isDark ? 0.18 : 0.3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Ученики
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyActive}
                onChange={handleActiveFilterChange}
                sx={{
                  '& .MuiSwitch-switchBase': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.success.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.success.light,
                    opacity: 1,
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    opacity: 1,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: 'white', 
                textShadow: '0 1px 4px rgba(80,0,120,0.25)' 
              }}>
                Только активные
              </Typography>
            }
            sx={{ mr: 2 }}
          />
          
          <TextField
            id="search-student"
            placeholder="Поиск ученика..."
            type="search"
            variant="outlined"
            value={searchValue}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                background: alpha('#fff', 0.12),
                color: 'white',
                '& .MuiInputBase-input': { color: 'white' },
              }
            }}
            sx={{ 
              minWidth: 280, 
              maxWidth: 340, 
              input: { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
              '& .MuiInputAdornment-root svg': { color: 'white' },
            }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBtnClick}
            sx={{
              background: 'white',
              color: theme.palette.primary.main,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              boxShadow: 'none',
              borderRadius: 2,
              '&:hover': {
                background: alpha('#ffffff', isDark ? 0.7 : 0.9),
              }
            }}
          >
            Добавить студента
          </Button>
        </Box>
      </Paper>

      <UnifiedDataGrid
        rows={filteredStudents}
        columns={columns}
        loading={isLoadingStudents}
        entityType="students"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица учеников"
      />

      {/* Create Student Modal */}
      {isModalOpen && (
        <StudentForm
          open={isModalOpen}
          onClose={handleCloseModal}
          initialValues={{
            first_name: '',
            last_name: '',
            date_of_birth: null,
            client_id: null,
          }}
          validationSchema={studentSchemas.create}
          onSubmit={handleCreateStudent}
          isLoading={isCreatingStudent}
          title="Добавить нового ученика"
          subtitle="Заполните информацию о ученике"
          isEdit={false}
        />
      )}
    </Box>
  );
};
