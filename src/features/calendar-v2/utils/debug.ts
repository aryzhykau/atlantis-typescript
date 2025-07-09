// Переключатель отладки для drag & drop календаря
export const DEBUG_DRAG_DROP = false; // Тестируем отключение тултипов во время драга
 
export const debugLog = (...args: any[]) => {
  if (DEBUG_DRAG_DROP) {
    console.log(...args);
  }
}; 