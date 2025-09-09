/**
 * Unified calendar state management hook
 * Replaces multiple useState calls with a single reducer-based approach
 */

import { useReducer, useCallback } from 'react';
import { Dayjs } from 'dayjs';

export interface SelectedSlotInfo {
  date: Dayjs;
  time: string;
}

export interface CalendarModalState {
  type: 'template' | 'real' | null;
  eventId: number | null;
  isOpen: boolean;
}

export interface CalendarState {
  // Form state
  createForm: {
    isOpen: boolean;
    selectedSlot: SelectedSlotInfo | null;
  };
  
  // Modal state
  eventModal: CalendarModalState;
  
  // UI state
  isDragging: boolean;
  hoveredSlot: string | null;
}

type CalendarAction =
  | { type: 'OPEN_CREATE_FORM'; payload: SelectedSlotInfo }
  | { type: 'CLOSE_CREATE_FORM' }
  | { type: 'OPEN_EVENT_MODAL'; payload: { eventId: number; eventType: 'template' | 'real' } }
  | { type: 'CLOSE_EVENT_MODAL' }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_HOVERED_SLOT'; payload: string | null }
  | { type: 'RESET_STATE' };

const initialState: CalendarState = {
  createForm: {
    isOpen: false,
    selectedSlot: null,
  },
  eventModal: {
    type: null,
    eventId: null,
    isOpen: false,
  },
  isDragging: false,
  hoveredSlot: null,
};

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'OPEN_CREATE_FORM':
      return {
        ...state,
        createForm: {
          isOpen: true,
          selectedSlot: action.payload,
        },
      };
    
    case 'CLOSE_CREATE_FORM':
      return {
        ...state,
        createForm: {
          isOpen: false,
          selectedSlot: null,
        },
      };
    
    case 'OPEN_EVENT_MODAL':
      return {
        ...state,
        eventModal: {
          type: action.payload.eventType,
          eventId: action.payload.eventId,
          isOpen: true,
        },
      };
    
    case 'CLOSE_EVENT_MODAL':
      return {
        ...state,
        eventModal: {
          type: null,
          eventId: null,
          isOpen: false,
        },
      };
    
    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload,
      };
    
    case 'SET_HOVERED_SLOT':
      return {
        ...state,
        hoveredSlot: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

export interface UseCalendarStateReturn {
  state: CalendarState;
  actions: {
    openCreateForm: (slotInfo: SelectedSlotInfo) => void;
    closeCreateForm: () => void;
    openEventModal: (eventId: number, eventType: 'template' | 'real') => void;
    closeEventModal: () => void;
    setDragging: (isDragging: boolean) => void;
    setHoveredSlot: (slotKey: string | null) => void;
    resetState: () => void;
  };
}

/**
 * Custom hook for managing unified calendar state
 */
export const useCalendarState = (): UseCalendarStateReturn => {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  const actions = {
    openCreateForm: useCallback((slotInfo: SelectedSlotInfo) => {
      dispatch({ type: 'OPEN_CREATE_FORM', payload: slotInfo });
    }, []),

    closeCreateForm: useCallback(() => {
      dispatch({ type: 'CLOSE_CREATE_FORM' });
    }, []),

    openEventModal: useCallback((eventId: number, eventType: 'template' | 'real') => {
      dispatch({ type: 'OPEN_EVENT_MODAL', payload: { eventId, eventType } });
    }, []),

    closeEventModal: useCallback(() => {
      dispatch({ type: 'CLOSE_EVENT_MODAL' });
    }, []),

    setDragging: useCallback((isDragging: boolean) => {
      dispatch({ type: 'SET_DRAGGING', payload: isDragging });
    }, []),

    setHoveredSlot: useCallback((slotKey: string | null) => {
      dispatch({ type: 'SET_HOVERED_SLOT', payload: slotKey });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  return { state, actions };
};
