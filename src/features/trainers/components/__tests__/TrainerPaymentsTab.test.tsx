import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import TrainerPaymentsTab from '../TrainerPaymentsTab';
import { trainersApi } from '../../../../store/apis/trainersApi';

// Мокаем dayjs
jest.mock('dayjs', () => {
    const originalDayjs = jest.requireActual('dayjs');
    return {
        ...originalDayjs,
        __esModule: true,
        default: jest.fn((date) => ({
            format: jest.fn(() => '01.01.2024 12:00'),
            ...originalDayjs(date)
        }))
    };
});

// Создаем тестовый store
const createTestStore = () => {
    return configureStore({
        reducer: {
            [trainersApi.reducerPath]: trainersApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(trainersApi.middleware),
    });
};

// Мокаем API ответы
const mockPaymentHistoryResponse = {
    items: [
        {
            id: 1,
            client_id: 1,
            payment_id: null,
            invoice_id: null,
            operation_type: 'payment',
            amount: 100.50,
            balance_before: 1000.0,
            balance_after: 1100.50,
            description: 'Test payment',
            created_at: '2024-01-01T12:00:00Z',
            created_by_id: 1,
            client_first_name: 'John',
            client_last_name: 'Doe',
            created_by_first_name: 'Trainer',
            created_by_last_name: 'User',
            payment_description: 'Monthly subscription'
        },
        {
            id: 2,
            client_id: 2,
            payment_id: null,
            invoice_id: null,
            operation_type: 'refund',
            amount: -50.0,
            balance_before: 500.0,
            balance_after: 450.0,
            description: 'Test refund',
            created_at: '2024-01-02T12:00:00Z',
            created_by_id: 1,
            client_first_name: 'Jane',
            client_last_name: 'Smith',
            created_by_first_name: 'Trainer',
            created_by_last_name: 'User',
            payment_description: 'Refund for missed class'
        }
    ],
    total: 2,
    skip: 0,
    limit: 50,
    has_more: false
};

// Настраиваем MSW сервер
const server = setupServer(
    http.get('/api/trainers/:trainerId/payments', ({ params }) => {
        return Response.json(mockPaymentHistoryResponse);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithProvider = (component: React.ReactElement) => {
    const store = createTestStore();
    return render(
        <Provider store={store}>
            {component}
        </Provider>
    );
};

describe('TrainerPaymentsTab', () => {
    const defaultProps = {
        trainerId: 1
    };

    it('renders payment history table with data', async () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        // Проверяем заголовок
        expect(screen.getByText('Платежи тренера')).toBeInTheDocument();

        // Ждем загрузки данных
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Проверяем отображение сумм
        expect(screen.getByText('100.50 ₽')).toBeInTheDocument();
        expect(screen.getByText('-50.00 ₽')).toBeInTheDocument();

        // Проверяем типы операций
        expect(screen.getByText('payment')).toBeInTheDocument();
        expect(screen.getByText('refund')).toBeInTheDocument();
    });

    it('displays filters section', () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        expect(screen.getByText('Фильтры')).toBeInTheDocument();
        expect(screen.getByLabelText('Период')).toBeInTheDocument();
        expect(screen.getByLabelText('ID клиента')).toBeInTheDocument();
        expect(screen.getByLabelText('Сумма от')).toBeInTheDocument();
        expect(screen.getByLabelText('Сумма до')).toBeInTheDocument();
        expect(screen.getByLabelText('Дата от')).toBeInTheDocument();
        expect(screen.getByLabelText('Дата до')).toBeInTheDocument();
        expect(screen.getByLabelText('Поиск по описанию')).toBeInTheDocument();
    });

    it('allows changing period filter', async () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        const periodSelect = screen.getByLabelText('Период');
        fireEvent.mouseDown(periodSelect);

        // Проверяем опции периода
        expect(screen.getByText('Все время')).toBeInTheDocument();
        expect(screen.getByText('Неделя')).toBeInTheDocument();
        expect(screen.getByText('Месяц')).toBeInTheDocument();
        expect(screen.getByText('3 месяца')).toBeInTheDocument();

        // Выбираем неделю
        fireEvent.click(screen.getByText('Неделя'));
        expect(periodSelect).toHaveValue('week');
    });

    it('allows entering amount filters', () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        const amountMinInput = screen.getByLabelText('Сумма от');
        const amountMaxInput = screen.getByLabelText('Сумма до');

        fireEvent.change(amountMinInput, { target: { value: '50' } });
        fireEvent.change(amountMaxInput, { target: { value: '200' } });

        expect(amountMinInput).toHaveValue(50);
        expect(amountMaxInput).toHaveValue(200);
    });

    it('allows entering date filters', () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        const dateFromInput = screen.getByLabelText('Дата от');
        const dateToInput = screen.getByLabelText('Дата до');

        fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
        fireEvent.change(dateToInput, { target: { value: '2024-01-31' } });

        expect(dateFromInput).toHaveValue('2024-01-01');
        expect(dateToInput).toHaveValue('2024-01-31');
    });

    it('allows searching by description', () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        const descriptionInput = screen.getByLabelText('Поиск по описанию');
        fireEvent.change(descriptionInput, { target: { value: 'test payment' } });

        expect(descriptionInput).toHaveValue('test payment');
    });

    it('resets filters when reset button is clicked', () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        // Заполняем фильтры
        const amountMinInput = screen.getByLabelText('Сумма от');
        const descriptionInput = screen.getByLabelText('Поиск по описанию');

        fireEvent.change(amountMinInput, { target: { value: '50' } });
        fireEvent.change(descriptionInput, { target: { value: 'test' } });

        // Нажимаем кнопку сброса
        const resetButton = screen.getByText('Сбросить фильтры');
        fireEvent.click(resetButton);

        // Проверяем, что фильтры сброшены
        expect(amountMinInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
    });

    it('displays statistics when data is loaded', async () => {
        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText(/Всего записей: 2/)).toBeInTheDocument();
            expect(screen.getByText(/Показано: 2/)).toBeInTheDocument();
            expect(screen.getByText(/Пропущено: 0/)).toBeInTheDocument();
        });
    });

    it('handles API error gracefully', async () => {
        // Мокаем ошибку API
        server.use(
            http.get('/api/trainers/:trainerId/payments', () => {
                return Response.json({ detail: 'Internal server error' }, { status: 500 });
            })
        );

        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText(/Ошибка загрузки платежей/)).toBeInTheDocument();
        });
    });

    it('shows loading state', () => {
        // Мокаем медленный ответ
        server.use(
            http.get('/api/trainers/:trainerId/payments', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return Response.json(mockPaymentHistoryResponse);
            })
        );

        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        // Проверяем, что таблица в состоянии загрузки
        const dataGrid = screen.getByRole('grid');
        expect(dataGrid).toBeInTheDocument();
    });

    it('displays empty state when no payments', async () => {
        // Мокаем пустой ответ
        server.use(
            http.get('/api/trainers/:trainerId/payments', () => {
                return Response.json({
                    items: [],
                    total: 0,
                    skip: 0,
                    limit: 50,
                    has_more: false
                });
            })
        );

        renderWithProvider(<TrainerPaymentsTab {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText(/Всего записей: 0/)).toBeInTheDocument();
        });
    });
}); 