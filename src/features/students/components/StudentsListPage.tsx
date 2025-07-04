import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Link as MuiLink, Chip, Button, Modal, TextField, FormControlLabel, Checkbox, Autocomplete, DialogTitle, Dialog, DialogContent, Switch, InputAdornment, alpha, Paper, IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import { useGetStudentsQuery, useCreateStudentMutation } from '../../../store/apis/studentsApi';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { IClientUserGet } from '../../clients/models/client';
import { IStudent, IStudentCreatePayload, IStudentUpdatePayload } from '../models/student';
import dayjs, { Dayjs } from 'dayjs';
import { StudentForm } from './StudentForm';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';

// Функция для вычисления возраста
const calculateAge = (dateOfBirth: string): number => {
  const dobDayjs = dayjs(dateOfBirth);
  // console.log(`Parsing DoB: '${dateOfBirth}', Valid: ${dobDayjs.isValid()}`); // Keep this commented or remove if not needed
  if (!dobDayjs.isValid()) {
    return -1; // Или другое значение, указывающее на ошибку
  }
  return dayjs().diff(dobDayjs, 'year');
};

// Тип для формы, как он определен в StudentForm.tsx
interface StudentFormValuesForList {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
    client_id: number | null;
}

// Базовые начальные значения для формы создания студента
const baseInitialStudentFormValues: StudentFormValuesForList = {
    first_name: '',
    last_name: '',
    date_of_birth: null,
    client_id: null,
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: '50%' }, 
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 2,
};

export function StudentsListPage() {
  const { data: students, error, isLoading, refetch } = useGetStudentsQuery();
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
  const { displaySnackbar } = useSnackbar();
  
  useGetClientsQuery();
  // Состояние для текущих начальных значений формы студента, соответствующее StudentFormValues
  const [currentStudentFormValues, setCurrentStudentFormValues] = useState<StudentFormValuesForList>(baseInitialStudentFormValues);

  // Состояние для отображаемых студентов (для фильтрации)
  const [displayedStudents, setDisplayedStudents] = useState<IStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (students) {
        let filteredStudents = students;

        // Filter by search term
        if (searchTerm !== '') {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filteredStudents = filteredStudents.filter(student =>
                student.first_name.toLowerCase().includes(lowerSearchTerm) ||
                student.last_name.toLowerCase().includes(lowerSearchTerm) ||
                `${student.client.first_name.toLowerCase()} ${student.client.last_name.toLowerCase()}`.includes(lowerSearchTerm)
            );
        }

        // Filter by active status
        if (showOnlyActive) {
            filteredStudents = filteredStudents.filter(student => student.is_active);
        }

        setDisplayedStudents(filteredStudents);
    }
  }, [students, searchTerm, showOnlyActive]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleShowOnlyActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyActive(event.target.checked);
  };

  const handleOpenAddStudentModal = () => {
      setCurrentStudentFormValues(baseInitialStudentFormValues); // Сброс значений формы при открытии
      setIsAddStudentModalOpen(true);
  }
  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false);
    // refetch() уже не нужен здесь, так как invalidatesTags в createStudent должен обновить список
  };

  const handleCreateStudentSubmit = async (values: IStudentUpdatePayload) => {
    if (!values.client_id) {
        displaySnackbar('Клиент (родитель) не выбран.', 'error');
        return;
    }
    if (!values.first_name || !values.last_name || !values.date_of_birth) {
        displaySnackbar('Все поля (Имя, Фамилия, Дата рождения) должны быть заполнены.', 'error');
        return;
    }
    const payload: IStudentCreatePayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      client_id: values.client_id,
    };
    try {
      await createStudent(payload).unwrap();
      displaySnackbar('Студент успешно создан', 'success');
      handleCloseAddStudentModal(); 
      refetch();
    } catch (err: any) {
      console.error("Ошибка создания студента:", err);
      const errorDetail = err?.data?.detail || 'Не удалось создать студента';
      displaySnackbar(String(errorDetail), 'error');
    }
  };

  const columns: GridColDef<IStudent>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
      renderCell: (params: GridRenderCellParams<IStudent>) => (
        <MuiLink component={RouterLink} to={`/home/students/${params.row.id}`}>
          {params.value}
        </MuiLink>
      ),
    },
    {
      field: 'first_name',
      headerName: 'Имя',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'last_name',
      headerName: 'Фамилия',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'date_of_birth',
      headerName: 'Дата рождения',
      width: 130,
      valueFormatter: (value: string) => value ? dayjs(value).format('DD.MM.YYYY') : ''
    },
    {
      field: 'age',
      headerName: 'Возраст',
      width: 100,
      valueGetter: (_, row: IStudent ) => row.date_of_birth ? calculateAge(row.date_of_birth) : null,
    },
    {
      field: 'parentName',
      headerName: 'Родитель',
      valueGetter: (_, row: IStudent) => `${row.client.first_name} ${row.client.last_name}`,
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'hasActiveSubscription',
      headerName: 'Активный абонемент',
      width: 180,
      renderCell: (params: GridRenderCellParams<IStudent>) => (
        params.row.active_subscription_id 
          ? <Chip label="Есть" color="success" size="small" /> 
          : <Chip label="Нет" color="default" size="small" />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Статус',
      width: 120,
      renderCell: (params: GridRenderCellParams<IStudent>) => (
        params.row.is_active
          ? <Chip label="Активен" color="success" size="small" />
          : <Chip label="Неактивен" color="error" size="small" />
      ),
    },
  ];

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    // TODO: Улучшить обработку ошибок, возможно, использовать useSnackbar
    console.error('Ошибка загрузки студентов:', error);
    return <Typography color="error">Не удалось загрузить список студентов.</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Фильтры и поиск в отдельной карточке */}
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
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mr: 2 }}>
          Ученики
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showOnlyActive}
              onChange={handleShowOnlyActiveChange}
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
          label={<Typography variant="body2" sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 4px rgba(80,0,120,0.25)' }}>Только активные</Typography>}
          sx={{ mr: 2 }}
        />
        <TextField
          id="search-student"
          placeholder="Поиск ученика..."
          type="search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AddIcon sx={{ color: 'white', opacity: 0 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              background: alpha('#fff', 0.12),
              color: 'white',
              '& .MuiInputBase-input': { color: 'white' },
            }
          }}
          sx={{ minWidth: 280, maxWidth: 340, input: { color: 'white' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
            '& .MuiInputAdornment-root svg': { color: 'white' },
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddStudentModal}
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
          Добавить ученика
        </Button>
      </Paper>

      {/* Таблица без внешнего Paper и заголовка */}
      <Box sx={{ width: '100%', p: 0 }}>
        <DataGrid
          rows={displayedStudents || []}
          loading={isLoading}
          columns={columns}
          pageSizeOptions={[10]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 3,
            background: isDark ? alpha(theme.palette.background.paper, 0.85) : 'white',
            fontSize: '1rem',
            color: theme.palette.text.primary,
            boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(80,0,120,0.06)',
            '& .MuiDataGrid-columnHeaders': {
              background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
              fontWeight: 700,
              fontSize: '1.05rem',
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-row': {
              transition: 'background 0.2s',
            },
            '& .MuiDataGrid-row:hover': {
              background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-footerContainer': {
              background: 'transparent',
            },
            '& .MuiDataGrid-selectedRowCount': {
              display: 'none',
            },
            '& .MuiDataGrid-actionsCell': {
              display: 'flex',
              gap: 1,
            },
          }}
        />
      </Box>

      <Dialog
        open={isAddStudentModalOpen}
        onClose={handleCloseAddStudentModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }
        }}
      >
        {/* Градиентный заголовок модального окна */}
        <Box
          sx={{
            p: 3,
            background: gradients.primary,
            color: 'white',
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
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ fontSize: 28, mr: 1 }} /> Добавить ученика
            </Typography>
            <IconButton
              aria-label="Закрыть"
              onClick={handleCloseAddStudentModal}
              sx={{
                color: 'white',
                ml: 2,
                '&:hover': {
                  background: alpha('#ffffff', 0.15),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        {/* Контент модального окна */}
        <DialogContent sx={{ p: 3, '&:first-of-type': { pt: 0 } }}>
          {/* Форма добавления ученика */}
          <StudentForm
            initialValues={currentStudentFormValues}
            onSubmit={handleCreateStudentSubmit}
            onClose={handleCloseAddStudentModal}
            isLoading={isCreatingStudent}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
} 