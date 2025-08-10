
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

interface TrainerSalaryTabProps {
    trainerId: number;
}

const TrainerSalaryTab: React.FC<TrainerSalaryTabProps> = ({ trainerId }) => {
    const theme = useTheme();
    const gradients = useGradients();
    const { displaySnackbar } = useSnackbar();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState<any | null>(null);

    const { data: salaries, isLoading: isLoadingSalaries } = useGetTrainerSalariesQuery(trainerId);
    const { data: trainingTypes, isLoading: isLoadingTrainingTypes } = useGetTrainingTypesQuery({});

    const [addSalary] = useAddTrainerSalaryMutation();
    const [updateSalary] = useUpdateTrainerSalaryMutation();
    const [deleteSalary] = useDeleteTrainerSalaryMutation();

    const handleOpenModal = (salary: any | null = null) => {
        setEditingSalary(salary);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSalary(null);
        setIsModalOpen(false);
    };

    const handleSave = async (values: any) => {
        try {
            if (editingSalary) {
                await updateSalary({ salaryId: editingSalary.id, data: { salary: values.salary } }).unwrap();
                displaySnackbar('Salary updated successfully', 'success');
            } else {
                await addSalary({ trainerId, data: values }).unwrap();
                displaySnackbar('Salary added successfully', 'success');
            }
            handleCloseModal();
        } catch (error) {
            displaySnackbar('Error saving salary', 'error');
        }
    };

    const handleDelete = async (salaryId: number) => {
        try {
            await deleteSalary(salaryId).unwrap();
            displaySnackbar('Salary deleted successfully', 'success');
        } catch (error) {
            displaySnackbar('Error deleting salary', 'error');
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
                    Specific Salaries
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
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                                : 'linear-gradient(135deg, #3f87fe 0%, #00d2fe 100%)',
                        },
                    }}
                >
                    Add Salary
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Training Type</TableCell>
                            <TableCell align="right">Salary (€)</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salaries?.map((salary) => (
                            <TableRow key={salary.id}>
                                <TableCell component="th" scope="row">
                                    {trainingTypes?.find((tt: any) => tt.id === salary.training_type_id)?.name || 'N/A'}
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
    trainingTypes: any[];
    existingSalaries: any[];
    onSubmit: (values: any) => void;
    onClose: () => void;
    initialData?: any | null;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ trainingTypes, existingSalaries, onSubmit, onClose, initialData }) => {
    const [trainingTypeId, setTrainingTypeId] = useState(initialData?.training_type_id || '');
    const [salary, setSalary] = useState(initialData?.salary || '');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit({ training_type_id: trainingTypeId, salary: parseFloat(salary) });
    };

    const availableTrainingTypes = initialData 
        ? trainingTypes
        : trainingTypes.filter(tt => !existingSalaries.some(s => s.training_type_id === tt.id));

    return (
        <form onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2 }}>{initialData ? 'Edit Salary' : 'Add Salary'}</Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel>Training Type</InputLabel>
                <Select
                    value={trainingTypeId}
                    onChange={(e) => setTrainingTypeId(e.target.value as number)}
                    disabled={!!initialData}
                >
                    {availableTrainingTypes.map((tt) => (
                        <MenuItem key={tt.id} value={tt.id}>{tt.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Salary"
                type="number"
                fullWidth
                margin="normal"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
                <Button type="submit" variant="contained">Save</Button>
            </Box>
        </form>
    );
};

export default TrainerSalaryTab;
