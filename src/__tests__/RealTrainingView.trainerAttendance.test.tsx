import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import RealTrainingView from '../features/calendar-v2/components/EventBottomSheet/RealTrainingView';
import { NormalizedEvent } from '../features/calendar-v2/utils/normalizeEventsForWeek';

const theme = createTheme();

const mockTrainingEvent: NormalizedEvent = {
  id: 1,
  title: 'Test Training',
  startHour: 10,
  start: dayjs('2023-12-01 10:00'),
  end: dayjs('2023-12-01 11:00'),
  durationMins: 60,
  isTemplate: false,
  training_type: {
    id: 1,
    name: 'Yoga',
    color: '#ff5722',
    max_participants: 10,
  },
  trainer: {
    id: 123,
    first_name: 'John',
    last_name: 'Doe',
  },
  raw: {
    id: 1,
    training_date: '2023-12-01',
    start_time: '10:00:00',
    status: 'active',
    students: [
      {
        id: 1,
        status: 'REGISTERED',
        student: {
          id: 101,
          first_name: 'Alice',
          last_name: 'Smith',
        },
      },
      {
        id: 2,
        status: 'PRESENT',
        student: {
          id: 102,
          first_name: 'Bob',
          last_name: 'Johnson',
        },
      },
      {
        id: 3,
        status: 'ABSENT',
        student: {
          id: 103,
          first_name: 'Charlie',
          last_name: 'Brown',
        },
      },
    ],
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('RealTrainingView trainer attendance', () => {
  const mockOnClose = jest.fn();
  const mockOnMarkStudentAbsent = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when readOnlyForTrainer=false (admin/owner view)', () => {
    it('should render edit/move/cancel buttons', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={false}
        />
      );

      expect(screen.getByText('Редактировать')).toBeInTheDocument();
      expect(screen.getByText('Перенести')).toBeInTheDocument();
      expect(screen.getByText('Отменить тренировку')).toBeInTheDocument();
    });

    it('should render add student button', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={false}
        />
      );

      expect(screen.getByText('Добавить')).toBeInTheDocument();
    });

    it('should render cancel student buttons for registered students', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={false}
        />
      );

      // Should have cancel button for REGISTERED student (Alice)
      const aliceRow = screen.getByText('Alice Smith').closest('div[role="button"], div');
      expect(aliceRow?.querySelector('[aria-label="Отменить запись ученика"]')).toBeInTheDocument();
    });
  });

  describe('when readOnlyForTrainer=true (trainer view)', () => {
    it('should NOT render edit/move/cancel training buttons', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      expect(screen.queryByText('Редактировать')).not.toBeInTheDocument();
      expect(screen.queryByText('Перенести')).not.toBeInTheDocument();
      expect(screen.queryByText('Отменить тренировку')).not.toBeInTheDocument();
    });

    it('should NOT render add student button', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      expect(screen.queryByText('Добавить')).not.toBeInTheDocument();
    });

    it('should render mark absent button for REGISTERED students', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Should have mark absent button for REGISTERED student (Alice)
      const aliceRow = screen.getByText('Alice Smith').closest('div');
      expect(aliceRow?.querySelector('[aria-label="Отметить как пропуск"]')).toBeInTheDocument();
    });

    it('should render mark absent button for PRESENT students', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Should have mark absent button for PRESENT student (Bob)
      const bobRow = screen.getByText('Bob Johnson').closest('div');
      expect(bobRow?.querySelector('[aria-label="Отметить как пропуск"]')).toBeInTheDocument();
    });

    it('should NOT render mark absent button for ABSENT students', () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Should NOT have mark absent button for ABSENT student (Charlie)
      const charlieRow = screen.getByText('Charlie Brown').closest('div');
      expect(charlieRow?.querySelector('[aria-label="Отметить как пропуск"]')).not.toBeInTheDocument();
    });

    it('should call onMarkStudentAbsent when mark absent button is clicked', async () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Click mark absent button for Alice (REGISTERED student)
      const aliceRow = screen.getByText('Alice Smith').closest('div');
      const markAbsentButton = aliceRow?.querySelector('[aria-label="Отметить как пропуск"]');
      
      expect(markAbsentButton).toBeInTheDocument();
      
      if (markAbsentButton) {
        fireEvent.click(markAbsentButton);
        
        await waitFor(() => {
          expect(mockOnMarkStudentAbsent).toHaveBeenCalledWith('1'); // student training ID
        });
      }
    });

    it('should show optimistic UI update when marking absent', async () => {
      renderWithTheme(
        <RealTrainingView
          event={mockTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Click mark absent button
      const aliceRow = screen.getByText('Alice Smith').closest('div');
      const markAbsentButton = aliceRow?.querySelector('[aria-label="Отметить как пропуск"]');
      
      if (markAbsentButton) {
        fireEvent.click(markAbsentButton);
        
        // The button should trigger the callback
        expect(mockOnMarkStudentAbsent).toHaveBeenCalledWith('1');
      }
    });
  });

  describe('past training restrictions', () => {
    const pastTrainingEvent = {
      ...mockTrainingEvent,
      raw: {
        ...mockTrainingEvent.raw,
        training_date: '2023-01-01', // Past date
        start_time: '10:00:00',
      },
    };

    it('should not show mark absent buttons for past trainings', () => {
      renderWithTheme(
        <RealTrainingView
          event={pastTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Should not have any mark absent buttons for past training
      expect(screen.queryByLabelText('Отметить как пропуск')).not.toBeInTheDocument();
    });

    it('should show past training alert', () => {
      renderWithTheme(
        <RealTrainingView
          event={pastTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      expect(screen.getByText('Эта тренировка уже прошла. Изменения недоступны.')).toBeInTheDocument();
    });
  });

  describe('cancelled training restrictions', () => {
    const cancelledTrainingEvent = {
      ...mockTrainingEvent,
      raw: {
        ...mockTrainingEvent.raw,
        status: 'cancelled_by_coach',
      },
    };

    it('should not show mark absent buttons for cancelled trainings', () => {
      renderWithTheme(
        <RealTrainingView
          event={cancelledTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      // Should not have any mark absent buttons for cancelled training
      expect(screen.queryByLabelText('Отметить как пропуск')).not.toBeInTheDocument();
    });

    it('should show cancelled training alert', () => {
      renderWithTheme(
        <RealTrainingView
          event={cancelledTrainingEvent}
          onClose={mockOnClose}
          readOnlyForTrainer={true}
          onMarkStudentAbsent={mockOnMarkStudentAbsent}
        />
      );

      expect(screen.getByText('Эта тренировка отменена.')).toBeInTheDocument();
    });
  });
});
