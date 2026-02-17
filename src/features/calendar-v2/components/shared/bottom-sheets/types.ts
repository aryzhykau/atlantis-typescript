import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';

// Shared types for EventBottomSheet components
export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface StudentTemplate {
  id: number;
  student: Student;
  training_template_id: number;
  start_date?: string; // YYYY-MM-DD format
}

export interface EventBottomSheetProps {
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
}

export interface EventHeaderProps {
  event: NormalizedEvent;
  onClose: () => void;
}

export interface TrainerInfoProps {
  trainer?: {
    first_name?: string;
    last_name?: string;
  };
  typeColor: string;
}

export interface StudentListProps {
  students: any[];
  typeColor: string;
  title: string;
  maxDisplay?: number;
}

export interface AssignedStudentsProps {
  event: NormalizedEvent;
  localEvent: NormalizedEvent | null;
  onStudentRemove: (studentTemplate: StudentTemplate, event: NormalizedEvent) => void;
  onToggleAddStudent: () => void;
  addingStudentOpen: boolean;
}

export interface AddStudentFormProps {
  availableStudents: Student[];
  onAddStudent: (student: Student, startDate: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface EventActionsProps {
  onEdit: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export interface DeleteConfirmationProps {
  show: boolean;
  eventTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
