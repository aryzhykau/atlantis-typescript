/**
 * Unified calendar state management hook
 * Replaces multiple useState calls with a single reducer-based approach
 */

import { useReducer, useCallback } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../types';

export interface SelectedSlotInfo {
  date: Dayjs;
  time: string;
}

export interface CalendarModalState {
  type: 'template' | 'real' | null;
  eventId: number | null;
  isOpen: boolean;
}

export interface SlotEventsListModalState {
  isOpen: boolean;
  day: Dayjs | null;
  time: string | null;
  events: CalendarEvent[];
  isTemplate: boolean;
}

export interface CalendarState {
  // Form state
  createForm: {
    isOpen: boolean;
    selectedSlot: SelectedSlotInfo | null;
  };

  createRealTrainingForm: {
    isOpen: boolean;
    selectedSlot: SelectedSlotInfo | null;
  };
  
  // Modal state
  eventModal: CalendarModalState;
  slotEventsListModal: SlotEventsListModalState;
  
  // UI state
  isDragging: boolean;
  hoveredSlot: string | null;
}

type CalendarAction =
  | { type: 'OPEN_CREATE_FORM'; payload: SelectedSlotInfo }
  | { type: 'CLOSE_CREATE_FORM' }
  | { type: 'OPEN_CREATE_REAL_TRAINING_FORM'; payload: SelectedSlotInfo }
  | { type: 'CLOSE_CREATE_REAL_TRAINING_FORM' }
  | { type: 'OPEN_EVENT_MODAL'; payload: { eventId: number; eventType: 'template' | 'real' } }
  | { type: 'CLOSE_EVENT_MODAL' }
  | { type: 'OPEN_SLOT_EVENTS_LIST'; payload: { day: Dayjs; time: string; events: CalendarEvent[]; isTemplate: boolean } }
  | { type: 'CLOSE_SLOT_EVENTS_LIST' }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_HOVERED_SLOT'; payload: string | null }
  | { type: 'RESET_STATE' };

const initialState: CalendarState = {
  createForm: {
    isOpen: false,
    selectedSlot: null,
  },
  createRealTrainingForm: {
    isOpen: false,
    selectedSlot: null,
  },
  eventModal: {
    type: null,
    eventId: null,
    isOpen: false,
  },
  slotEventsListModal: {
    isOpen: false,
    day: null,
    time: null,
    events: [],
    isTemplate: true,
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

    case 'OPEN_CREATE_REAL_TRAINING_FORM':
      return {
        ...state,
        createRealTrainingForm: {
          isOpen: true,
          selectedSlot: action.payload,
        },
      };
    
    case 'CLOSE_CREATE_REAL_TRAINING_FORM':
      return {
        ...state,
        createRealTrainingForm: {
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
    
    case 'OPEN_SLOT_EVENTS_LIST':
      return {
        ...state,
        slotEventsListModal: {
          isOpen: true,
          day: action.payload.day,
          time: action.payload.time,
          events: action.payload.events,
          isTemplate: action.payload.isTemplate,
        },
      };
    
    case 'CLOSE_SLOT_EVENTS_LIST':
      return {
        ...state,
        slotEventsListModal: {
          isOpen: false,
          day: null,
          time: null,
          events: [],
          isTemplate: true,
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
    openCreateRealTrainingForm: (slotInfo: SelectedSlotInfo) => void;
    closeCreateRealTrainingForm: () => void;
    openEventModal: (eventId: number, eventType: 'template' | 'real') => void;
    closeEventModal: () => void;
    openSlotEventsList: (day: Dayjs, time: string, events: CalendarEvent[], isTemplate: boolean) => void;
    closeSlotEventsList: () => void;
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

    openCreateRealTrainingForm: useCallback((slotInfo: SelectedSlotInfo) => {
      dispatch({ type: 'OPEN_CREATE_REAL_TRAINING_FORM', payload: slotInfo });
    }, []),

    closeCreateRealTrainingForm: useCallback(() => {
      dispatch({ type: 'CLOSE_CREATE_REAL_TRAINING_FORM' });
    }, []),

    openEventModal: useCallback((eventId: number, eventType: 'template' | 'real') => {
      dispatch({ type: 'OPEN_EVENT_MODAL', payload: { eventId, eventType } });
    }, []),

    closeEventModal: useCallback(() => {
      dispatch({ type: 'CLOSE_EVENT_MODAL' });
    }, []),

    openSlotEventsList: useCallback((day: Dayjs, time: string, events: CalendarEvent[], isTemplate: boolean) => {
      dispatch({ type: 'OPEN_SLOT_EVENTS_LIST', payload: { day, time, events, isTemplate } });
    }, []),

    closeSlotEventsList: useCallback(() => {
      dispatch({ type: 'CLOSE_SLOT_EVENTS_LIST' });
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
