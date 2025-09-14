import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
  useTheme,
  SwipeableDrawer,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { calendarApiV2 } from '../../../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { useCreateTrainingStudentTemplateMutation } from '../../../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import ConfirmDeleteBottomSheet from './ConfirmDeleteBottomSheet';
import { useDeleteTrainingStudentTemplateMutation } from '../../../../../store/apis/calendarApi-v2';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import EditBottomSheet from './EditBottomSheet';
import TransferBottomSheet from './TransferBottomSheet';
import EventGroupView from './EventGroupView';
import RealTrainingView from './RealTrainingView';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface StudentTemplate {
  id: number;
  student: Student;
  training_template_id: number;
}

interface EventBottomSheetProps {
  open: boolean;
  eventOrHourGroup: NormalizedEvent | NormalizedEvent[] | null;
  mode: 'event' | 'group';
  onClose: () => void;
  onSave?: (event: NormalizedEvent) => void;
  onMove?: (event: NormalizedEvent) => void;
  onRequestMove?: (event: NormalizedEvent, transferData?: any) => void;
  onDelete?: (event: NormalizedEvent) => void;
  onRequestEdit?: (event: NormalizedEvent, updates?: Partial<NormalizedEvent>) => void;
  onAssignedStudentDeleted?: (trainingTemplateId: number, studentTemplateId: number) => void;
  readOnlyForTrainer?: boolean;
  onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>;
}

const EventBottomSheet: React.FC<EventBottomSheetProps> = ({
  open,
  eventOrHourGroup,
  mode,
  onClose,
  onDelete,
  onRequestEdit,
  onRequestMove,
  onAssignedStudentDeleted,
  readOnlyForTrainer = false,
  onMarkStudentAbsent,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();
  
  const [deleteTrainingStudentTemplate, { isLoading: isDeletingAssigned }] = useDeleteTrainingStudentTemplateMutation();
  const [createTrainingStudentTemplate, { isLoading: isCreatingAssigned }] = useCreateTrainingStudentTemplateMutation();
  const { data: allStudents } = useGetStudentsQuery();
  
  // Edit and Transfer inline form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState<NormalizedEvent | null>(null);
  const [currentTransferEvent, setCurrentTransferEvent] = useState<NormalizedEvent | null>(null);
  
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<NormalizedEvent | null>(null);
  const [confirmingAssigned, setConfirmingAssigned] = useState<{ assigned: StudentTemplate; event: NormalizedEvent } | null>(null);
  const [addingStudentOpen, setAddingStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [localEvent, setLocalEvent] = useState<NormalizedEvent | null>(!Array.isArray(eventOrHourGroup) ? eventOrHourGroup : null);

  // Ref for scrolling to the add student form
  const addStudentFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Array.isArray(eventOrHourGroup)) {
      setLocalEvent(eventOrHourGroup);
    } else {
      setLocalEvent(null);
    }
  }, [eventOrHourGroup]);

  const formatTime = useCallback((time?: string) => {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    return time;
  }, []);

  const handleEdit = useCallback((evt?: NormalizedEvent) => {
    const event = evt ?? (Array.isArray(eventOrHourGroup) ? null : eventOrHourGroup);
    if (!event || Array.isArray(event)) return;
    setCurrentEditEvent(event);
    setShowEditForm(true);
  }, [eventOrHourGroup]);

  const handleDelete = useCallback((event: NormalizedEvent) => {
    setPendingDeleteEvent(event);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteEvent) return;
    onDelete?.(pendingDeleteEvent);
    setPendingDeleteEvent(null);
  }, [pendingDeleteEvent, onDelete]);

  const cancelDelete = useCallback(() => {
    setPendingDeleteEvent(null);
  }, []);

  const handleMove = useCallback((evt?: NormalizedEvent) => {
    const event = evt ?? (Array.isArray(eventOrHourGroup) ? null : eventOrHourGroup);
    if (!event || Array.isArray(event)) return;
    setCurrentTransferEvent(event);
    setShowTransferForm(true);
  }, [eventOrHourGroup]);

  // Inline form handlers
  const handleEditSave = useCallback((event: NormalizedEvent, updates: Partial<NormalizedEvent>) => {
    // Pass through the updates provided by EditBottomSheet so parent can construct the API payload
    onRequestEdit?.(event, updates);
    setShowEditForm(false);
    setCurrentEditEvent(null);
  }, [onRequestEdit]);

  const handleEditCancel = useCallback(() => {
    setShowEditForm(false);
    setCurrentEditEvent(null);
  }, []);

  const handleTransferSave = useCallback((event: NormalizedEvent, transferData: any) => {
    onRequestMove?.(event, transferData);
    setShowTransferForm(false);
    setCurrentTransferEvent(null);
  }, [onRequestMove]);

  const handleTransferCancel = useCallback(() => {
    setShowTransferForm(false);
    setCurrentTransferEvent(null);
  }, []);

  // Memoize available students for better performance
  const availableStudents = useMemo(() => 
    (allStudents || []).filter(s => s.is_active), 
    [allStudents]
  );

  // Filter available students to exclude already assigned ones
  const filteredAvailableStudents = useMemo(() => {
    if (!localEvent?.raw?.assigned_students) return availableStudents;
    
    const assignedStudentIds = new Set(
      localEvent.raw.assigned_students.map((assigned: any) => assigned.student?.id).filter(Boolean)
    );
    
    return availableStudents.filter(student => !assignedStudentIds.has(student.id));
  }, [availableStudents, localEvent?.raw?.assigned_students]);

  // Function to scroll to add student form
  const scrollToAddStudentForm = useCallback(() => {
    if (addStudentFormRef.current) {
      addStudentFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      
      // Focus on the autocomplete input after scroll
      setTimeout(() => {
        const autocompleteInput = addStudentFormRef.current?.querySelector('input[placeholder="Начните вводить имя..."]') as HTMLInputElement;
        autocompleteInput?.focus();
      }, 300);
    }
  }, []);

  // Handle opening add student form with scroll
  const handleToggleAddStudent = useCallback(() => {
    const isOpening = !addingStudentOpen;
    setAddingStudentOpen(isOpening);
    
    if (isOpening) {
      // Wait for the form to render, then scroll to it
      setTimeout(scrollToAddStudentForm, 100);
    } else {
      // Reset form when closing
      setSelectedStudent(null);
    }
  }, [addingStudentOpen, scrollToAddStudentForm]);

  const handleAssignedDeleteConfirm = useCallback(async () => {
    if (!confirmingAssigned || !confirmingAssigned.assigned) return;
    const assignedId = confirmingAssigned.assigned.id;
    if (!assignedId) return setConfirmingAssigned(null);

    try {
      const deleted = await deleteTrainingStudentTemplate(assignedId).unwrap();
      setConfirmingAssigned(null);
      const templateId = (!Array.isArray(eventOrHourGroup) && eventOrHourGroup?.isTemplate) 
        ? eventOrHourGroup.id 
        : confirmingAssigned?.event?.id || confirmingAssigned?.assigned?.training_template_id;
      
      if (deleted && deleted.id) {
        const tId = deleted.training_template_id || templateId;
        if (tId) {
          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplateById', tId, (draft: any) => {
              if (!draft) return;
              draft.assigned_students = (draft.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {
            console.warn('Failed to update training template by id cache', e);
          }

          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplates', undefined, (draft: any[]) => {
              if (!Array.isArray(draft)) return;
              const template = draft.find(t => t.id === tId);
              if (!template) return;
              template.assigned_students = (template.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {
            console.warn('Failed to update training templates cache', e);
          }
        }
      }
      
      if (templateId) {
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateId }]));
      }
      
      try {
        const tIdNum = Number(deleted.training_template_id || templateId);
        if (!Number.isNaN(tIdNum)) onAssignedStudentDeleted?.(tIdNum, deleted.id);
      } catch (e) {
        console.warn('Failed to call onAssignedStudentDeleted callback', e);
      }
      
      displaySnackbar('Ученик удалён из шаблона', 'success');
    } catch (err) {
      console.error('[EventBottomSheet] Failed to delete assigned student:', err);
      displaySnackbar('Ошибка при удалении ученика из шаблона', 'error');
    }
  }, [confirmingAssigned, deleteTrainingStudentTemplate, eventOrHourGroup, dispatch, onAssignedStudentDeleted, displaySnackbar]);

  const renderSingleEvent = useCallback((event: NormalizedEvent) => {
    console.log('Rendering single event in EventBottomSheet:', event); // Debug log
    const trainerName = event.trainer
      ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim()
      : 'Не указан';

    const trainerInitials = event.trainer
      ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase()
      : '?';

    const typeColor = event.training_type?.color || theme.palette.primary.main;

    const handleAddAssignedStudent = async () => {
      if (!selectedStudent) return displaySnackbar('Выберите ученика', 'warning');
      const evt = localEvent || event;
      if (!evt?.id) return displaySnackbar('Неверный шаблон', 'error');
      
      try {
        const payload = {
          training_template_id: evt.id,
          student_id: selectedStudent.id,
          start_date: startDate,
        };
        const created = await createTrainingStudentTemplate(payload).unwrap();
        const tId = created.training_template_id || evt.id;
        
        try {
          (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplateById', tId, (draft: any) => {
            if (!draft) return;
            draft.assigned_students = draft.assigned_students || [];
            draft.assigned_students.push(created);
          }));
        } catch (e) {
          console.warn('Failed to update training template by id cache', e);
        }
        
        try {
          (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplates', undefined, (draft: any[]) => {
            if (!Array.isArray(draft)) return;
            const template = draft.find(t => t.id === tId);
            if (!template) return;
            template.assigned_students = template.assigned_students || [];
            template.assigned_students.push(created);
          }));
        } catch (e) {
          console.warn('Failed to update training templates cache', e);
        }
        
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: tId }]));
        
        setLocalEvent(prev => {
          if (!prev) return prev;
          const next = { ...prev } as any;
          next.raw = { ...next.raw };
          next.raw.assigned_students = [...(next.raw.assigned_students || []), created];
          return next as NormalizedEvent;
        });
        
        displaySnackbar('Ученик добавлен в шаблон', 'success');
        setAddingStudentOpen(false);
        setSelectedStudent(null);
      } catch (err) {
        console.error('[EventBottomSheet] Failed to add assigned student:', err);
        displaySnackbar('Ошибка при добавлении ученика', 'error');
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1, letterSpacing: 0.2 }}>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {event.training_type && <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: typeColor }} />}
                {event.training_type && <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{event.training_type.name}</Typography>}
                {event.training_type?.max_participants && (
                  <Chip label={`Макс: ${event.training_type.max_participants}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22, ml: 1 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{formatTime(event.raw?.start_time)}</Typography>
              </Box>
            </Box>
          </Box>

          <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Trainer Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: theme.palette.background.default, mb: 3 }}>
          <Avatar sx={{ bgcolor: typeColor, width: 48, height: 48, fontSize: '1.1rem', fontWeight: 600 }}>{trainerInitials}</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{trainerName}</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Тренер</Typography>
          </Box>
        </Box>

        {/* Students Information - Enhanced styling */}
        {event.raw?.students && event.raw.students.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              color: theme.palette.text.secondary, 
              mb: 2, 
              textTransform: 'uppercase', 
              letterSpacing: 0.5, 
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              Ученики ({event.raw.students.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {event.raw.students.slice(0, 5).map((student: any, index: number) => (
                <Box 
                  key={student.id || index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main + '40',
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    fontSize: '0.9rem', 
                    backgroundColor: typeColor + '20', 
                    color: typeColor, 
                    fontWeight: 600,
                    border: `2px solid ${typeColor}30`,
                  }}>
                    {student.student?.first_name?.charAt(0) || student.first_name?.charAt(0) || '?'}
                    {student.student?.last_name?.charAt(0) || student.last_name?.charAt(0) || ''}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: theme.palette.text.primary,
                      mb: 0.5,
                    }}>
                      {student.student?.first_name || student.first_name || 'Имя'} {student.student?.last_name || student.last_name || 'Фамилия'}
                    </Typography>
                    {student.status && (
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary, 
                        fontSize: '0.75rem',
                        backgroundColor: theme.palette.info.main + '10',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 500,
                      }}>
                        Статус: {student.status}
                      </Typography>
                    )}
                  </Box>
                  {student.requires_payment && (
                    <Chip 
                      label="Оплата" 
                      size="small" 
                      color="warning" 
                      variant="filled" 
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 24,
                        fontWeight: 600,
                      }} 
                    />
                  )}
                </Box>
              ))}
              {event.raw.students.length > 5 && (
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary, 
                  textAlign: 'center', 
                  fontStyle: 'italic',
                  py: 1,
                  fontSize: '0.8rem',
                }}>
                  И ещё {event.raw.students.length - 5} учеников...
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Template Students Information (add button moved into header) */}

        {(localEvent?.isTemplate || (event.raw?.assigned_students && event.raw.assigned_students.length > 0)) && (
          <Box sx={{ mb: 3 }}>
            {(() => {
              const assignedStudents = (localEvent?.raw?.assigned_students || event.raw?.assigned_students || []);
              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: theme.palette.text.secondary, 
                      textTransform: 'uppercase', 
                      letterSpacing: 0.5, 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      Назначенные ученики ({assignedStudents.length})
                    </Typography>
                    {localEvent?.isTemplate && (
                      <Button
                        aria-label="Добавить ученика"
                        onClick={handleToggleAddStudent}
                        disabled={Boolean(localEvent?.training_type?.max_participants && (assignedStudents.length || 0) >= localEvent?.training_type?.max_participants)}
                        startIcon={<PersonAddIcon fontSize="small" />}
                        variant={addingStudentOpen ? "outlined" : "contained"}
                        size="small"
                        sx={{ 
                          textTransform: 'none', 
                          height: 36,
                          borderRadius: 2,
                          fontWeight: 600,
                          minWidth: 'fit-content',
                          px: 2,
                          ...(addingStudentOpen ? {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            backgroundColor: 'transparent',
                          } : {
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            }
                          })
                        }}
                      >
                        {addingStudentOpen ? 'Скрыть' : 'Добавить'}
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {assignedStudents.slice(0, 5).map((studentTemplate: any, index: number) => (
                      <Box 
                        key={studentTemplate.id || index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.main + '40',
                          }
                        }}
                      >
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          fontSize: '0.9rem', 
                          backgroundColor: typeColor + '20', 
                          color: typeColor, 
                          fontWeight: 600,
                          border: `2px solid ${typeColor}30`,
                        }}>
                          {studentTemplate.student?.first_name?.charAt(0) || '?'}
                          {studentTemplate.student?.last_name?.charAt(0) || ''}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.text.primary,
                            mb: 0.5,
                          }}>
                            {studentTemplate.student?.first_name || 'Имя'} {studentTemplate.student?.last_name || 'Фамилия'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary, 
                            fontSize: '0.75rem',
                            backgroundColor: theme.palette.primary.main + '10',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontWeight: 500,
                          }}>
                            В шаблоне
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setConfirmingAssigned({ assigned: studentTemplate, event })}
                          sx={{ 
                            color: theme.palette.error.main, 
                            backgroundColor: theme.palette.error.main + '10',
                            width: 36,
                            height: 36,
                            '&:hover': { 
                              backgroundColor: theme.palette.error.main + '20',
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                          aria-label="Удалить ученика"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    {assignedStudents.length > 5 && (
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary, 
                        textAlign: 'center', 
                        fontStyle: 'italic',
                        py: 1,
                        fontSize: '0.8rem',
                      }}>
                        И ещё {assignedStudents.length - 5} учеников...
                      </Typography>
                    )}

                    {addingStudentOpen && localEvent?.isTemplate && (
                      <Box 
                        ref={addStudentFormRef}
                        key="adding-student" 
                        sx={{ 
                          p: 3,
                          borderRadius: 3, 
                          backgroundColor: theme.palette.background.paper,
                          border: `2px solid ${theme.palette.primary.main}20`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          mt: 2,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            borderRadius: '3px 3px 0 0',
                          }
                        }}
                      >
                        {/* Form Header */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: 3,
                        }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            fontSize: '1.2rem', 
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                          }}>
                            <PersonAddIcon fontSize="medium" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.text.primary,
                              mb: 0.5,
                            }}>
                              Добавить ученика в шаблон
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.text.secondary,
                              fontSize: '0.875rem',
                            }}>
                              {filteredAvailableStudents.length > 0 
                                ? `Доступно ${filteredAvailableStudents.length} учеников`
                                : 'Все ученики уже добавлены в шаблон'
                              }
                            </Typography>
                          </Box>
                        </Box>

                        {/* Show message if no students available */}
                        {filteredAvailableStudents.length === 0 && (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 3,
                            color: theme.palette.text.secondary,
                          }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Все активные ученики уже добавлены в этот шаблон
                            </Typography>
                            <Button 
                              variant="outlined" 
                              onClick={() => setAddingStudentOpen(false)}
                              sx={{ textTransform: 'none' }}
                            >
                              Закрыть
                            </Button>
                          </Box>
                        )}

                        {/* Form Fields - only show if students available */}
                        {filteredAvailableStudents.length > 0 && (
                          <>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 2, 
                              mb: 3,
                              alignItems: { xs: 'stretch', sm: 'flex-end' }
                            }}>
                              <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
                                <Typography variant="body2" sx={{ 
                                  color: theme.palette.text.secondary, 
                                  mb: 1,
                                  fontWeight: 500,
                                }}>
                                  Ученик
                                </Typography>
                                <Autocomplete
                                  options={filteredAvailableStudents}
                                  getOptionLabel={(opt: Student) => `${opt.first_name} ${opt.last_name}`}
                                  value={selectedStudent}
                                  onChange={(_, val) => setSelectedStudent(val)}
                                  renderInput={(params) => (
                                    <TextField 
                                      {...params} 
                                      placeholder="Начните вводить имя..." 
                                      variant="outlined" 
                                      size="medium"
                                      sx={{ 
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: 2,
                                          height: 48,
                                          backgroundColor: theme.palette.background.default,
                                          '& fieldset': {
                                            borderRadius: 2,
                                          },
                                          '&:hover fieldset': {
                                            borderRadius: 2,
                                          },
                                          '&.Mui-focused fieldset': {
                                            borderRadius: 2,
                                          }
                                        },
                                        '& .MuiInputBase-input': {
                                          backgroundColor: 'transparent',
                                        }
                                      }}
                                    />
                                  )}
                                  renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 2,
                                      p: 1.5,
                                    }}>
                                      <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        fontSize: '0.8rem',
                                        backgroundColor: theme.palette.primary.main + '20',
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                      }}>
                                        {option.first_name.charAt(0)}{option.last_name.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {option.first_name} {option.last_name}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  )}
                                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                                  noOptionsText="Ученики не найдены"
                                  autoHighlight
                                  clearOnBlur={false}
                                />
                              </Box>
                              
                              <Box sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                                <Typography variant="body2" sx={{ 
                                  color: theme.palette.text.secondary, 
                                  mb: 1,
                                  fontWeight: 500,
                                }}>
                                  Дата начала
                                </Typography>
                                <TextField
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                  fullWidth
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      height: 48,
                                      backgroundColor: theme.palette.background.default,
                                      '& fieldset': {
                                        borderRadius: 2,
                                      },
                                      '&:hover fieldset': {
                                        borderRadius: 2,
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderRadius: 2,
                                      }
                                    },
                                    '& .MuiInputBase-input': {
                                      backgroundColor: 'transparent',
                                    }
                                  }}
                                />
                              </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 2,
                              justifyContent: 'flex-end',
                              '& > button': {
                                minHeight: 44,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: 100,
                              }
                            }}>
                              <Button 
                                variant="outlined" 
                                onClick={() => { 
                                  setAddingStudentOpen(false); 
                                  setSelectedStudent(null); 
                                }} 
                                sx={{ 
                                  borderColor: theme.palette.divider,
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    borderColor: theme.palette.text.secondary,
                                    backgroundColor: theme.palette.action.hover,
                                  }
                                }}
                              >
                                Отмена
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleAddAssignedStudent}
                                disabled={isCreatingAssigned || !selectedStudent}
                                startIcon={isCreatingAssigned ? null : <PersonAddIcon />}
                                sx={{ 
                                  backgroundColor: theme.palette.primary.main,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                  },
                                  '&:disabled': {
                                    backgroundColor: theme.palette.action.disabledBackground,
                                  }
                                }}
                              >
                                {isCreatingAssigned ? 'Добавление...' : 'Добавить ученика'}
                              </Button>
                            </Box>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                </>
              );
            })()}
          </Box>
        )}

        {/* Action Buttons - Improved mobile-friendly layout */}
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
            onClick={() => handleEdit(event)}
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
            onClick={() => handleMove(event)}
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
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(event)}
            color="error"
            sx={{
              flex: 1,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: theme.palette.error.main + '10',
              }
            }}
          >
            Удалить
          </Button>
        </Box>
      </Box>
    );
  }, [theme, localEvent, selectedStudent, startDate, addingStudentOpen, filteredAvailableStudents, isCreatingAssigned, 
      handleEdit, handleMove, handleDelete, pendingDeleteEvent, eventOrHourGroup, confirmDelete, cancelDelete,
      createTrainingStudentTemplate, dispatch, displaySnackbar, formatTime, onClose, handleToggleAddStudent]);

  const renderEventGroup = useCallback((events: NormalizedEvent[]) => {
    return (
      <EventGroupView
        events={events}
        onClose={onClose}
        onRequestMove={onRequestMove}
        onRequestEdit={onRequestEdit}
        onDelete={onDelete}
      />
    );
  }, [onClose, onRequestMove, onRequestEdit, onDelete]);

  if (!eventOrHourGroup) return null;

  return (
    <>
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 1400,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
          backdropFilter: 'blur(8px)',
          maxHeight: '85vh',
          overflow: 'hidden',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
    >
      {/* Handle bar for visual feedback */}
      <Box sx={{ 
        width: 48, 
        height: 4, 
        background: theme.palette.divider, 
        borderRadius: 2, 
        mx: 'auto', 
        mt: 2, 
        mb: 1,
        opacity: 0.6,
      }} />

      {/* Content container with proper padding */}
      <Box sx={{ 
        p: 3, 
        overflowY: 'auto',
        height: '100%',
      }}>
        {mode === 'event' && !Array.isArray(eventOrHourGroup) 
          ? (eventOrHourGroup.isTemplate 
              ? renderSingleEvent(eventOrHourGroup)
              : <RealTrainingView 
                  event={eventOrHourGroup}
                  onClose={onClose}
                  onRequestMove={onRequestMove}
                  onRequestEdit={onRequestEdit}
                  onCancel={onDelete}
                  readOnlyForTrainer={readOnlyForTrainer}
                  onMarkStudentAbsent={onMarkStudentAbsent}
                />
            )
          : Array.isArray(eventOrHourGroup) 
            ? renderEventGroup(eventOrHourGroup) 
            : null
        }
      </Box>
      
      {/* Confirm delete assigned student */}
      <ConfirmDeleteBottomSheet
        open={Boolean(confirmingAssigned)}
        title="Подтвердить удаление"
        message={confirmingAssigned ? `Вы уверены, что хотите удалить ученика "${confirmingAssigned.assigned.student?.first_name} ${confirmingAssigned.assigned.student?.last_name}" из шаблона?` : 'Вы уверены, что хотите удалить этого ученика из шаблона?'}
        onClose={() => setConfirmingAssigned(null)}
        onConfirm={handleAssignedDeleteConfirm}
        confirming={isDeletingAssigned}
      />
      
      {/* Confirm delete event */}
      <ConfirmDeleteBottomSheet
        open={Boolean(pendingDeleteEvent)}
        title="Подтвердить удаление"
        message={pendingDeleteEvent ? `Вы уверены, что хотите удалить тренировку "${pendingDeleteEvent.title}"?` : 'Вы уверены, что хотите удалить эту тренировку?'}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirming={false}
      />
    </SwipeableDrawer>
    
    {/* Edit Bottom Sheet - Only for non-trainer users */}
    {!readOnlyForTrainer && (
      <EditBottomSheet
        event={currentEditEvent}
        open={showEditForm}
        onSave={handleEditSave}
        onClose={handleEditCancel}
      />
    )}
    
    {/* Transfer Bottom Sheet - Only for non-trainer users */}
    {!readOnlyForTrainer && (
      <TransferBottomSheet
        event={currentTransferEvent}
        open={showTransferForm}
        onSave={handleTransferSave}
        onClose={handleTransferCancel}
      />
    )}
    </>
  );
};

export default EventBottomSheet;

