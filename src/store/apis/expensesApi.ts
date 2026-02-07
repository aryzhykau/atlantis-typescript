import { baseApi } from './api';
import { IExpense, IExpenseType, IExpenseCreate, IExpenseTypeCreate } from '../../features/expenses/models';

export const expensesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query<IExpense[], { user_id?: number, expense_type_id?: number, start_date?: string }>({
            query: (params) => ({
                url: 'expenses/',
                params,
            }),
            providesTags: (result) => 
                result 
                    ? [...result.map(({ id }) => ({ type: 'Expenses' as const, id })), { type: 'Expenses', id: 'LIST' }]
                    : [{ type: 'Expenses', id: 'LIST' }],
        }),
        createExpense: builder.mutation<IExpense, IExpenseCreate>({
            query: (body) => ({
                url: 'expenses/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Expenses', id: 'LIST' }],
        }),
        updateExpense: builder.mutation<IExpense, { expenseId: number; body: Partial<IExpenseCreate> }>({
            query: ({ expenseId, body }) => ({
                url: `expenses/${expenseId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'Expenses', id: 'LIST' }],
        }),
        deleteExpense: builder.mutation<IExpense, number>({
            query: (expenseId) => ({
                url: `expenses/${expenseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Expenses', id: 'LIST' }],
        }),
        // Expense Types
        getExpenseTypes: builder.query<IExpenseType[], void>({
            query: () => 'expenses/types/',
            providesTags: (result) => 
                result
                    ? [...result.map(({ id }) => ({ type: 'ExpenseTypes' as const, id })), { type: 'ExpenseTypes', id: 'LIST' }]
                    : [{ type: 'ExpenseTypes', id: 'LIST' }],
        }),
        createExpenseType: builder.mutation<IExpenseType, IExpenseTypeCreate>({
            query: (body) => ({
                url: 'expenses/types/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'ExpenseTypes', id: 'LIST' }],
        }),
        updateExpenseType: builder.mutation<IExpenseType, { id: number; body: IExpenseTypeCreate }>({
            query: ({ id, body }) => ({
                url: `expenses/types/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'ExpenseTypes', id: 'LIST' }],
        }),
        deleteExpenseType: builder.mutation<IExpenseType, number>({
            query: (id) => ({
                url: `expenses/types/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'ExpenseTypes', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetExpenseTypesQuery,
    useCreateExpenseTypeMutation,
    useUpdateExpenseTypeMutation,
    useDeleteExpenseTypeMutation
} = expensesApi;
