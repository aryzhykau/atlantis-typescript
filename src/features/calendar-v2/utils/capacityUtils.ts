/**
 * Утилиты для расчета загруженности тренировок и цветового кодирования
 */

export interface CapacityInfo {
  current: number;
  max: number;
  percentage: number;
  color: string;
  isFull: boolean;
}

/**
 * Рассчитывает информацию о загруженности тренировки
 */
export const calculateCapacity = (currentCount: number, maxParticipants: number | null): CapacityInfo => {
  // Если max_participants не задан, используем большое число чтобы не показывать ограничения
  const max = maxParticipants || 999;
  const percentage = max > 0 ? (currentCount / max) * 100 : 0;
  
  let color: string;
  let isFull = false;
  
  if (percentage >= 100) {
    color = '#f44336'; // красный - переполнена
    isFull = true;
  } else if (percentage >= 90) {
    color = '#ff9800'; // оранжевый - почти полная  
  } else if (percentage >= 70) {
    color = '#ffc107'; // жёлтый - заполняется
  } else {
    color = '#4caf50'; // зелёный - много свободных мест
  }
  
  return {
    current: currentCount,
    max,
    percentage,
    color,
    isFull
  };
};

/**
 * Форматирует текст бейджика загруженности
 */
export const formatCapacityText = (capacityInfo: CapacityInfo): string => {
  // Если максимум очень большой (999), не показываем его
  if (capacityInfo.max >= 999) {
    return `${capacityInfo.current}`;
  }
  
  return `${capacityInfo.current}/${capacityInfo.max}`;
};

/**
 * Определяет, нужно ли показывать бейджик загруженности
 */
export const shouldShowCapacityBadge = (capacityInfo: CapacityInfo): boolean => {
  // Показываем только если есть студенты или есть ограничение
  return capacityInfo.current > 0 || (capacityInfo.max < 999);
}; 