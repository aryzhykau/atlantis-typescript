import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Link as MuiLink, Chip, Button, Modal, TextField, FormControlLabel, Checkbox, Autocomplete, DialogTitle, Dialog, DialogContent } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import { useGetStudentsQuery, useCreateStudentMutation } from '../../../store/apis/studentsApi';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { IClientUserGet } from '../../clients/models/client';
import { IStudent, IStudentCreatePayload, IStudentUpdatePayload } from '../models/student';
import dayjs, { Dayjs } from 'dayjs';
import { StudentForm } from './StudentForm';
import { useSnackbar } from '../../../hooks/useSnackBar';

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
}

// Базовые начальные значения для формы создания студента
const baseInitialStudentFormValues: StudentFormValuesForList = {
    first_name: '',
    last_name: '',
    date_of_birth: null,
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
  
  const { data: clients, isLoading: isLoadingClients, error: errorClients } = useGetClientsQuery();
  const [selectedClient, setSelectedClient] = useState<IClientUserGet | null>(null);
  // Состояние для текущих начальных значений формы студента, соответствующее StudentFormValues
  const [currentStudentFormValues, setCurrentStudentFormValues] = useState<StudentFormValuesForList>(baseInitialStudentFormValues);

  // Состояние для отображаемых студентов (для фильтрации)
  const [displayedStudents, setDisplayedStudents] = useState<IStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

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
      setSelectedClient(null);
      setCurrentStudentFormValues(baseInitialStudentFormValues); // Сброс значений формы при открытии
      setIsAddStudentModalOpen(true);
  }
  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false);
    // refetch() уже не нужен здесь, так как invalidatesTags в createStudent должен обновить список
  };

  const handleCreateStudentSubmit = async (values: IStudentUpdatePayload) => {
    if (!selectedClient || !selectedClient.id) {
        displaySnackbar('Клиент (родитель) не выбран.', 'error');
        return;
    }
    
    // Убедимся, что все необходимые поля присутствуют, так как IStudentUpdatePayload опционален
    if (!values.first_name || !values.last_name || !values.date_of_birth) {
        displaySnackbar('Все поля (Имя, Фамилия, Дата рождения) должны быть заполнены.', 'error');
        return;
    }

    const payload: IStudentCreatePayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth, // StudentForm уже передает строку 'YYYY-MM-DD' или null
      client_id: selectedClient.id,
      // is_active можно не указывать, бэкенд по умолчанию ставит true
    };

    try {
      await createStudent(payload).unwrap();
      displaySnackbar('Студент успешно создан', 'success');
      handleCloseAddStudentModal(); 
      refetch(); // Все же вызовем refetch, чтобы список точно обновился
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
    <Box sx={{ height: 'auto', width: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ flexGrow: 1 }}>
                Список студентов
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenAddStudentModal}>
                Добавить студента
            </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <TextField
                label="Поиск студента (Имя, Фамилия студента, Имя/Фамилия родителя)"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ flexGrow: 1 }}
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={showOnlyActive}
                    onChange={handleShowOnlyActiveChange}
                    name="showOnlyActive"
                    color="primary"
                />
                }
                label="Только активные"
                sx={{ whiteSpace: 'nowrap' }}
            />
        </Box>
      <DataGrid
        rows={displayedStudents}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        loading={isLoading}
        disableRowSelectionOnClick
        sx={{
            '& .MuiDataGrid-columnHeaders': {
                backgroundColor: (theme) => theme.palette.grey[200], 
                fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:hover': {
                backgroundColor: (theme) => theme.palette.action.hover, 
            },
            minHeight: 400,
        }}
        />
      <Dialog open={isAddStudentModalOpen} onClose={handleCloseAddStudentModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent>
            <DialogTitle sx={{ pb: 1 }}>Добавить нового студента</DialogTitle>
            <Autocomplete
                options={clients || []}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                value={selectedClient}
                onChange={(_, newValue) => {
                    setSelectedClient(newValue);
                    if (newValue) {
                        setCurrentStudentFormValues(prev => ({...prev, last_name: newValue.last_name}));
                    }
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <TextField {...params} label="Выберите клиента (родителя)" margin="normal" fullWidth />
                )}
                loading={isLoadingClients}
                disabled={isLoadingClients}
                sx={{mb: 2}}
            />
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