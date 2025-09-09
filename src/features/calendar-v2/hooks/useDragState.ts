/**
 * Unified drag state management hook for calendar drag & drop operations
 * Centralizes drag state and reduces complexity across components
 */

import { useReducer, useCallback, useRef } from 'react';
import { CalendarEvent } from '../components/CalendarShell';
import { Dayjs } from 'dayjs';

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragPreview: {
    isVisible: boolean;
    position: { x: number; y: number };
  };
  dropZone: {
    isActive: boolean;
    target: { day: Dayjs; time: string } | null;
    isValidDrop: boolean;
  };
  performance: {
    startTime: number | null;
    frameCount: number;
  };
}

export interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate: boolean;
  isVirtualCopy?: boolean;
}

type DragAction =
  | { type: 'DRAG_START'; payload: { item: DragItem; position: { x: number; y: number } } }
  | { type: 'DRAG_MOVE'; payload: { position: { x: number; y: number } } }
  | { type: 'DRAG_ENTER_DROP_ZONE'; payload: { day: Dayjs; time: string; isValid: boolean } }
  | { type: 'DRAG_LEAVE_DROP_ZONE' }
  | { type: 'DRAG_END'; payload?: { success: boolean } }
  | { type: 'UPDATE_PERFORMANCE'; payload: { frameCount: number } }
  | { type: 'RESET' };

const initialState: DragState = {
  isDragging: false,
  dragItem: null,
  dragPreview: {
    isVisible: false,
    position: { x: 0, y: 0 },
  },
  dropZone: {
    isActive: false,
    target: null,
    isValidDrop: false,
  },
  performance: {
    startTime: null,
    frameCount: 0,
  },
};

const dragReducer = (state: DragState, action: DragAction): DragState => {
  switch (action.type) {
    case 'DRAG_START':
      return {
        ...state,
        isDragging: true,
        dragItem: action.payload.item,
        dragPreview: {
          isVisible: true,
          position: action.payload.position,
        },
        performance: {
          startTime: Date.now(),
          frameCount: 0,
        },
      };

    case 'DRAG_MOVE':
      return {
        ...state,
        dragPreview: {
          ...state.dragPreview,
          position: action.payload.position,
        },
        performance: {
          ...state.performance,
          frameCount: state.performance.frameCount + 1,
        },
      };

    case 'DRAG_ENTER_DROP_ZONE':
      return {
        ...state,
        dropZone: {
          isActive: true,
          target: { day: action.payload.day, time: action.payload.time },
          isValidDrop: action.payload.isValid,
        },
      };

    case 'DRAG_LEAVE_DROP_ZONE':
      return {
        ...state,
        dropZone: {
          isActive: false,
          target: null,
          isValidDrop: false,
        },
      };

    case 'DRAG_END':
      return {
        ...initialState,
        performance: {
          startTime: state.performance.startTime,
          frameCount: state.performance.frameCount,
        },
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          frameCount: action.payload.frameCount,
        },
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

export interface UseDragStateReturn {
  state: DragState;
  actions: {
    startDrag: (item: DragItem, position: { x: number; y: number }) => void;
    updateDragPosition: (position: { x: number; y: number }) => void;
    enterDropZone: (day: Dayjs, time: string, isValid: boolean) => void;
    leaveDropZone: () => void;
    endDrag: (success?: boolean) => void;
    reset: () => void;
    getPerformanceStats: () => { duration: number; fps: number } | null;
  };
}

/**
 * Hook for managing unified drag state with performance tracking
 */
export const useDragState = (): UseDragStateReturn => {
  const [state, dispatch] = useReducer(dragReducer, initialState);
  const performanceRef = useRef<{ lastFrameTime: number }>({ lastFrameTime: 0 });

  const actions = {
    startDrag: useCallback((item: DragItem, position: { x: number; y: number }) => {
      performanceRef.current.lastFrameTime = Date.now();
      dispatch({ type: 'DRAG_START', payload: { item, position } });
    }, []),

    updateDragPosition: useCallback((position: { x: number; y: number }) => {
      // Throttle position updates for better performance
      const now = Date.now();
      if (now - performanceRef.current.lastFrameTime > 16) { // ~60fps
        performanceRef.current.lastFrameTime = now;
        dispatch({ type: 'DRAG_MOVE', payload: { position } });
      }
    }, []),

    enterDropZone: useCallback((day: Dayjs, time: string, isValid: boolean) => {
      dispatch({ type: 'DRAG_ENTER_DROP_ZONE', payload: { day, time, isValid } });
    }, []),

    leaveDropZone: useCallback(() => {
      dispatch({ type: 'DRAG_LEAVE_DROP_ZONE' });
    }, []),

    endDrag: useCallback((success: boolean = false) => {
      dispatch({ type: 'DRAG_END', payload: { success } });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),

    getPerformanceStats: useCallback(() => {
      const { startTime, frameCount } = state.performance;
      if (!startTime) return null;

      const duration = Date.now() - startTime;
      const fps = frameCount > 0 ? Math.round((frameCount * 1000) / duration) : 0;

      return { duration, fps };
    }, [state.performance]),
  };

  return { state, actions };
};
