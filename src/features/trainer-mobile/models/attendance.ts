export interface AttendanceUpdate {
  status: 'PRESENT' | 'ABSENT';
  cancellation_reason?: string;
} 