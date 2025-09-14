import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Button,
} from '@mui/material';
import { AccessTime as TimeIcon, Edit as EditIcon, Cancel as CancelIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import CancelStudentBottomSheet from './CancelStudentBottomSheet';
import AddStudentToRealTrainingBottomSheet from './AddStudentToRealTrainingBottomSheet';
import CancelTrainingBottomSheet from './CancelTrainingBottomSheet';
import EditBottomSheet from './EditBottomSheet';
import TransferBottomSheet from './TransferBottomSheet';
import EventHeader from './EventHeader';
import StudentList from './StudentList';
import StudentListItem from './StudentListItem';

interface RealTrainingViewProps {
  event: NormalizedEvent;
  onClose: () => void;
  onRequestMove?: (event: NormalizedEvent, transferData?: any) => void;
  onRequestEdit?: (event: NormalizedEvent) => void;
  onCancel?: (event: NormalizedEvent) => void;
  readOnlyForTrainer?: boolean;
  onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>;
}

/**
 * RealTrainingView - Component for displaying real training events
 * Handles cancellation instead of deletion, student management, and past training restrictions
 */
const RealTrainingView: React.FC<RealTrainingViewProps> = ({
  event,
  onClose,
  onRequestMove,
  onRequestEdit,
  onCancel,
  readOnlyForTrainer = false,
  onMarkStudentAbsent,
}) => {
  const theme = useTheme();

  // ...local UI state & handlers moved below after isTrainingCancelled

  // Form state - commented out for now
  // const [showEditForm, setShowEditForm] = useState(false);
  // const [showTransferForm, setShowTransferForm] = useState(false);
  // const [showCancelStudentForm, setShowCancelStudentForm] = useState(false);
  // const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  // const [showCancelTrainingForm, setShowCancelTrainingForm] = useState(false);
  // const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Check if training is in the past
  const isPastTraining = useMemo(() => {
    if (!event.raw?.training_date || !event.raw?.start_time) return false;
    
    const trainingDateTime = dayjs(`${event.raw.training_date} ${event.raw.start_time}`);
    return trainingDateTime.isBefore(dayjs());
  }, [event.raw?.training_date, event.raw?.start_time]);

  // Check if training is cancelled
  const isTrainingCancelled = useMemo(() => {
    const raw: any = event.raw || event;
    return (
      raw?.status === 'cancelled_by_coach' ||
      raw?.status === 'cancelled_by_admin' ||
      Boolean(raw?.cancelled_at) ||
      Boolean(raw?.cancelled) ||
      Boolean(raw?.is_cancelled) ||
      Boolean(raw?.raw?.cancelled_at)
    );
  }, [event]);

  // Local UI state for bottom-sheet dialogs (placed after training-status calculations)
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showCancelStudentForm, setShowCancelStudentForm] = useState(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showCancelTrainingForm, setShowCancelTrainingForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const handleOpenEdit = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    setShowEditForm(true);
  }, [isPastTraining, isTrainingCancelled]);

  const handleCloseEdit = useCallback(() => {
    setShowEditForm(false);
  }, []);

  const handleOpenTransfer = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    setShowTransferForm(true);
  }, [isPastTraining, isTrainingCancelled]);

  const handleCloseTransfer = useCallback(() => {
    setShowTransferForm(false);
  }, []);

  const handleCancelStudent = useCallback((student: any) => {
    if (isPastTraining || isTrainingCancelled) return;
    setSelectedStudent(student);
    setShowCancelStudentForm(true);
  }, [isPastTraining, isTrainingCancelled]);

  const handleCancelStudentClose = useCallback(() => {
    setSelectedStudent(null);
    setShowCancelStudentForm(false);
  }, []);

  const handleAddStudent = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    setShowAddStudentForm(true);
  }, [isPastTraining, isTrainingCancelled]);

  const handleAddStudentClose = useCallback(() => {
    setShowAddStudentForm(false);
  }, []);

  const handleCancelTraining = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    setShowCancelTrainingForm(true);
  }, [isPastTraining, isTrainingCancelled]);

  const handleCancelTrainingClose = useCallback(() => {
    setShowCancelTrainingForm(false);
  }, []);

  // Get active and cancelled students
  const { activeStudents, cancelledStudents } = useMemo(() => {
    if (!event.raw?.students) return { activeStudents: [], cancelledStudents: [] };
    
    const active = event.raw.students.filter((s: any) => 
      s.status === 'REGISTERED' || s.status === 'PRESENT' || s.status === 'ABSENT'
    );
    const cancelled = event.raw.students.filter((s: any) => 
      s.status === 'CANCELLED_SAFE' || s.status === 'CANCELLED_PENALTY'
    );
    
    return { activeStudents: active, cancelledStudents: cancelled };
  }, [event.raw?.students]);

  const trainerName = event.trainer
    ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim()
    : 'Не указан';

  const trainerInitials = event.trainer
    ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase()
    : '?';

  // Prevent TS unused local errors - these values may be helpful for future UI but are intentionally unused now
  void handleAddStudent;
  void trainerName;
  void trainerInitials;

  const typeColor = event.training_type?.color || theme.palette.primary.main;

  // Handlers that wire to provided callbacks / local state
  const handleEdit = useCallback(() => handleOpenEdit(), [/* deps handled */]);
  const handleMove = useCallback(() => handleOpenTransfer(), []);

  const handleSaveEdit = useCallback((updatedEvent?: NormalizedEvent) => {
    setShowEditForm(false);
    if (updatedEvent) onRequestEdit?.(updatedEvent);
  }, [onRequestEdit]);

  const handleSaveTransfer = useCallback((transferData?: any) => {
    setShowTransferForm(false);
    onRequestMove?.(event, transferData);
  }, [onRequestMove, event]);
  return (
    <>
      <Box sx={{ p: 3, pb: 4 }}>
        <EventHeader event={event} onClose={onClose} />
        {/* Students */}
        {activeStudents.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Записанные ученики ({activeStudents.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {activeStudents.map((studentTraining: any) => (
                <StudentListItem
                  key={studentTraining.id}
                  studentTraining={studentTraining}
                  typeColor={typeColor}
                  showCancel={!readOnlyForTrainer && !isPastTraining && !isTrainingCancelled}
                  showMarkAbsent={readOnlyForTrainer && !isPastTraining && !isTrainingCancelled}
                  onCancel={handleCancelStudent}
                  onMarkAbsent={onMarkStudentAbsent}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Cancelled Students (read-only list) */}
        {cancelledStudents.length > 0 && (
          <StudentList
            students={cancelledStudents}
            typeColor={typeColor}
            title="Отмененные записи"
          />
        )}

        {/* No Students Message */}
        {activeStudents.length === 0 && cancelledStudents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2, color: theme.palette.text.secondary, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>Нет записанных учеников</Typography>
            <Typography variant="body2">На эту тренировку никто не записан</Typography>
          </Box>
        )}

        {/* Action Buttons or Cancelled indicator */}
        {!readOnlyForTrainer && (
          isTrainingCancelled ? (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: theme.palette.action.disabledBackground, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Отменена</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Действия недоступны для отмененной тренировки</Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              mt: 3,
              '& > button': {
                minHeight: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }
            }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                disabled={isPastTraining || isTrainingCancelled}
                sx={{ 
                  flex: 1,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Редактировать
              </Button>
              
              <Button
                variant="contained"
                startIcon={<TimeIcon />}
                onClick={handleMove}
                disabled={isPastTraining || isTrainingCancelled}
                sx={{
                  flex: 1,
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  color: theme.palette.getContrastText(theme.palette.secondary.main),
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Перенести
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelTraining}
                disabled={isPastTraining || isTrainingCancelled}
                color="warning"
                sx={{
                  flex: 1,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: theme.palette.warning.main + '10',
                  }
                }}
              >
                Отменить тренировку
              </Button>
            </Box>
          )
        )}
      </Box>

      <EditBottomSheet
        event={event}
        open={showEditForm}
        onSave={handleSaveEdit}
        onClose={handleCloseEdit}
      />

      <TransferBottomSheet
        event={event}
        open={showTransferForm}
        onSave={handleSaveTransfer}
        onClose={handleCloseTransfer}
      />

      <CancelStudentBottomSheet
        open={showCancelStudentForm}
        student={selectedStudent}
        training={event}
        onClose={handleCancelStudentClose}
      />

      <AddStudentToRealTrainingBottomSheet
        open={showAddStudentForm}
        training={event}
        onClose={handleAddStudentClose}
      />

      <CancelTrainingBottomSheet
        open={showCancelTrainingForm}
        training={event}
        onClose={handleCancelTrainingClose}
        onCancel={onCancel}
      />
    </>
  );
};

export default RealTrainingView;
