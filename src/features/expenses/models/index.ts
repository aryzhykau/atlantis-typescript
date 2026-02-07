export interface IExpense {
    id: number;
    user_id: number;
    expense_type_id: number;
    amount: number;
    expense_date: string;
    description?: string;
    
    // Joined fields (optional)
    expense_type?: IExpenseType;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
    }
}

export interface IExpenseType {
    id: number;
    name: string;
    description?: string;
}

export interface IExpenseCreate {
    user_id: number;
    expense_type_id: number;
    amount: number;
    expense_date: string;
    description?: string;
}

export interface IExpenseTypeCreate {
    name: string;
    description?: string;
}
