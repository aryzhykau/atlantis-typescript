import { useGetTrainingTemplatesQuery } from '../../../store/apis/calendarApi-v2';

export const useTrainings = (trainerId?: number, startWeek?: string, endWeek?: string) => {
  const { data: trainings, isLoading, error } = useGetTrainingTemplatesQuery({});

  // Группируем тренировки по датам
  const groupedTrainingsByDate = trainings?.reduce((acc, training) => {
    const date = training.start_time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(training);
    return acc;
  }, {} as Record<string, typeof trainings>) || {};

  return {
    trainings: trainings || [],
    isLoading,
    error,
    groupedTrainingsByDate,
  };
}; 