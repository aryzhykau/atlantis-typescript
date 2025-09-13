/**
 * Attendance API helper for marking student attendance
 */

// Get the base URL from the existing API configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Marks a student as absent for a training
 * @param trainingId - ID of the training
 * @param studentTrainingId - ID of the student training record
 * @returns Updated student training record
 */
export async function markStudentAbsent(
  trainingId: string,
  studentTrainingId: string
): Promise<any> {
  const response = await fetch(`${BASE_URL}/real-trainings/${trainingId}/students/${studentTrainingId}/attendance`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ status: 'ABSENT' }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
