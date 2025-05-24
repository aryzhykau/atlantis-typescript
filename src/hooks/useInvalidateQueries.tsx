import { useCallback } from 'react';

/**
 * Хук для инвалидации нескольких запросов одновременно
 * 
 * @param queries Массив функций refetch от разных запросов
 * @returns Функция, которая вызывает refetch всех переданных запросов
 * 
 * @example
 * const { refetch: refetchClients } = useGetClientsQuery();
 * const { refetch: refetchSubscriptions } = useGetSubscriptionsQuery();
 * 
 * const invalidateAll = useInvalidateQueries([
 *   refetchClients,
 *   refetchSubscriptions
 * ]);
 * 
 * // Затем при необходимости:
 * invalidateAll(); // Обновит оба запроса
 */
export const useInvalidateQueries = (queries: Array<() => Promise<any>>) => {
  const invalidateAll = useCallback(() => {
    const promises = queries.map(refetch => {
      if (typeof refetch === 'function') {
        return refetch();
      }
      return Promise.resolve();
    });
    
    return Promise.all(promises);
  }, [queries]);

  return invalidateAll;
};

export default useInvalidateQueries;
