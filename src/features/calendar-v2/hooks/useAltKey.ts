import { useState, useEffect, useRef } from 'react';

export const useAltKey = () => {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const altStateRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        setIsAltPressed(true);
        altStateRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Сбрасываем если Alt не нажат
      if (!e.altKey) {
        setIsAltPressed(false);
        altStateRef.current = false;
      }
    };

    const handleBlur = () => {
      setIsAltPressed(false);
      altStateRef.current = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAltPressed(false);
        altStateRef.current = false;
      }
    };

    // Дополнительные обработчики для сброса "залипания" Alt
    const handleMouseUp = (e: MouseEvent) => {
      // Принудительно проверяем Alt при любом mouseup
      if (!e.altKey) {
        setIsAltPressed(false);
        altStateRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Проверяем состояние Alt во время движения мыши
      if (altStateRef.current && !e.altKey) {
        setIsAltPressed(false);
        altStateRef.current = false;
      }
    };

    // Добавляем обработчики
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    window.addEventListener('blur', handleBlur, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Функция для получения актуального состояния
  const getCurrentAltState = () => altStateRef.current;

  // Функция для принудительного сброса состояния (на случай "залипания")
  const forceResetAltState = () => {
    setIsAltPressed(false);
    altStateRef.current = false;
  };

  return { isAltPressed, getCurrentAltState, forceResetAltState };
}; 