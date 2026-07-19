import type { Category } from '@/features/categories/types';

export type RecurrenceType = 'monthly' | 'biweekly' | 'weekly';

export type FixedExpense = {
    id: number;
    user_id: number;
    name: string;
    provider_name: string | null;
    category_id: number;
    category: Category;
    default_amount: number;
    recurrence_type: RecurrenceType;
    day_of_month: number | null;
    day_of_week: number | null;
    anchor_date: string | null;
    is_active: boolean;
    sort_order: number;
};

export type FixedExpenseOccurrence = {
    id: number;
    fixed_expense_id: number;
    fixed_expense: FixedExpense;
    due_date: string;
    expected_amount: number;
    paid_amount: number | null;
    paid_at: string | null;
    notes: string | null;
};

export type OccurrenceStatus =
    | 'paid'
    | 'overdue'
    | 'within_window'
    | 'scheduled';

export type FixedExpenseFormValues = {
    name: string;
    provider_name: string;
    category_id: string;
    default_amount: string;
    recurrence_type: RecurrenceType;
    day_of_month: string;
    day_of_week: string;
    anchor_date: string;
    is_active: boolean;
};

export type MarkAsPaidFormValues = {
    paid_amount: string;
    paid_at: string;
    description: string;
};
