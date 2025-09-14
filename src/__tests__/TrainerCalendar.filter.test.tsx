import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import TrainerMobileCalendar from '../features/calendar-v2/components/mobile/layout/TrainerMobileCalendar';
import { baseApi } from '../store/apis/api';

// Mock the useCurrentUser hook
jest.mock('../hooks/usePermissions', () => ({
  useCurrentUser: () => ({
    user: { id: 123, role: 'TRAINER' },
    isLoading: false,
    error: null,
  }),
}));

// Mock the calendar API
const mockRealTrainings = [
  {
    id: 1,
    responsible_trainer_id: 123, // Current trainer's training
    training_date: '2023-12-01',
    start_time: '10:00',
    training_type: { name: 'Yoga', color: '#ff5722' },
    students: [],
  },
  {
    id: 2,
    responsible_trainer_id: 456, // Different trainer's training
    training_date: '2023-12-01',
    start_time: '11:00',
    training_type: { name: 'Pilates', color: '#2196f3' },
    students: [],
  },
];

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      api: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('TrainerCalendar filtering', () => {
  beforeEach(() => {
    // Mock the API response
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/real-trainings/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRealTrainings),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should only show trainings for the current trainer', async () => {
    renderWithProviders(<TrainerMobileCalendar />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByText('Загружаются тренировки...')).not.toBeInTheDocument();
    });

    // Should show the trainer's own training
    expect(screen.queryByText('Yoga')).toBeInTheDocument();
    
    // Should NOT show other trainer's training
    expect(screen.queryByText('Pilates')).not.toBeInTheDocument();
  });

  it('should fetch trainings with correct trainer filter', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    
    renderWithProviders(<TrainerMobileCalendar />);
    
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('trainer_id=123'),
        expect.any(Object)
      );
    });
  });

  it('should not show create button or viewmode selector', () => {
    renderWithProviders(<TrainerMobileCalendar />);
    
    // Should not have tabs for switching between templates/real trainings
    expect(screen.queryByText('📋 Шаблон')).not.toBeInTheDocument();
    expect(screen.queryByText('🏃‍♂️ Тренировки')).not.toBeInTheDocument();
    
    // Should not have add/create button
    expect(screen.queryByRole('button', { name: /добавить/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/добавить тренировку/i)).not.toBeInTheDocument();
  });

  it('should show weekdays selector and month picker', () => {
    renderWithProviders(<TrainerMobileCalendar />);
    
    // Should have month picker button
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument(); // Year in month picker
    
    // Should show weekday navigation (days of week)
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekDays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });
});
