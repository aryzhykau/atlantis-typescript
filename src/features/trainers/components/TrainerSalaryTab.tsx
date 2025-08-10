
import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Button, 
    Dialog, 
    DialogContent, 
    TextField, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton,
    alpha,
    useTheme
} from '@mui/material';
import { 
    useGetTrainerSalariesQuery, 
    useAddTrainerSalaryMutation, 
    useUpdateTrainerSalaryMutation, 
    useDeleteTrainerSalaryMutation 
} from '../../../store/apis/trainerSalariesApi';
import { useGetTrainingTypesQuery } from '../../../store/apis/trainingTypesApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { ITrainerTrainingTypeSalary } from '../models/trainer';
import { ITrainingType } from '../../training-types/models/trainingType';

interface TrainerSalaryTabProps {
    trainerId: number;
}

const TrainerSalaryTab: React.FC<TrainerSalaryTabProps> = ({ trainerId }) => {
    const theme = useTheme();
    const gradients = useGradients();
    const { displaySnackbar } = useSnackbar();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState<ITrainerTrainingTypeSalary | null>(null);

    const { data: salaries, isLoading: isLoadingSalaries } = useGetTrainerSalariesQuery(trainerId);
    const { data: trainingTypes, isLoading: isLoadingTrainingTypes } = useGetTrainingTypesQuery({});

    const [addSalary] = useAddTrainerSalaryMutation();
    const [updateSalary] = useUpdateTrainerSalaryMutation();
    const [deleteSalary] = useDeleteTrainerSalaryMutation();

    const handleOpenModal = (salary: ITrainerTrainingTypeSalary | null = null) => {
        setEditingSalary(salary);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSalary(null);
        setIsModalOpen(false);
    };

    const handleSave = async (values: { training_type_id: number; salary: number }) => {
        try {
            if (editingSalary) {
                await updateSalary({ salaryId: editingSalary.id, data: { salary: values.salary } }).unwrap();
                displaySnackbar('Зарплата успешно обновлена', 'success');
            } else {
                await addSalary({ trainerId, data: { ...values, trainer_id: trainerId } }).unwrap();
                displaySnackbar('Зарплата успешно добавлена', 'success');
            }
            handleCloseModal();
        } catch (error) {
            displaySnackbar('Ошибка сохранения зарплаты', 'error');
            console.error(error)
        }
    };

    const handleDelete = async (salaryId: number) => {
        try {
            await deleteSalary(salaryId).unwrap();
            displaySnackbar('Зарплата успешно удалена', 'success');
        } catch (error) {
            displaySnackbar('Ошибка удаления зарплаты', 'error');
        }
    };

    if (isLoadingSalaries || isLoadingTrainingTypes) {
        return <CircularProgress />;
    }

    return (
        <Paper 
            elevation={0}
            sx={{ 
                mb: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: theme.palette.background.paper,
            }}
        >
            <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Зарплаты по типам тренировок
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenModal()}
                    sx={{ 
                        background: gradients.success,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': {
                             background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                        },
                    }}
                >
                    Добавить зарплату
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Тип тренировки</TableCell>
                            <TableCell align="right">Зарплата (€)</TableCell>
                            <TableCell align="right">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salaries?.map((salary) => (
                            <TableRow key={salary.id}>
                                <TableCell component="th" scope="row">
                                    {trainingTypes?.find((tt: ITrainingType) => tt.id === salary.training_type_id)?.name || 'N/A'}
                                </TableCell>
                                <TableCell align="right">{salary.salary}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenModal(salary)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(salary.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogContent sx={{ p: 3 }}>
                    <SalaryForm 
                        trainingTypes={trainingTypes || []}
                        existingSalaries={salaries || []}
                        onSubmit={handleSave} 
                        onClose={handleCloseModal}
                        initialData={editingSalary} 
                    />
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

interface SalaryFormProps {
    trainingTypes: ITrainingType[];
    existingSalaries: ITrainerTrainingTypeSalary[];
    onSubmit: (values: { training_type_id: number, salary: number }) => void;
    onClose: () => void;
    initialData?: ITrainerTrainingTypeSalary | null;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ trainingTypes, existingSalaries, onSubmit, onClose, initialData }) => {
    const [trainingTypeId, setTrainingTypeId] = useState(initialData?.training_type_id || '');
    const [salary, setSalary] = useState(initialData?.salary || '');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if(!trainingTypeId || !salary) {
            // Or show a snackbar
            alert('Please fill all fields');
            return
        }
        onSubmit({ training_type_id: Number(trainingTypeId), salary: parseFloat(salary as string) });
    };

    const availableTrainingTypes = initialData 
        ? trainingTypes
        : trainingTypes.filter(tt => !existingSalaries.some(s => s.training_type_id === tt.id));

    return (
        <form onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2 }}>{initialData ? 'Редактировать зарплату' : 'Добавить зарплату'}</Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel>Тип тренировки</InputLabel>
                <Select
                    value={trainingTypeId}
                    label="Тип тренировки"
                    onChange={(e) => setTrainingTypeId(e.target.value as number)}
                    disabled={!!initialData}
                    required
                >
                    {availableTrainingTypes.map((tt) => (
                        <MenuItem key={tt.id} value={tt.id}>{tt.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Зарплата"
                type="number"
                fullWidth
                margin="normal"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                required
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>Отмена</Button>
                <Button type="submit" variant="contained">Сохранить</Button>
            </Box>
        </form>
    );
};

export default TrainerSalaryTab;
