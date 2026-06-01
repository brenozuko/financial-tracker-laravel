import type { Category } from '@/features/categories/types';

export type { Category };

export type Transaction = {
    id: number;
    user_id: number;
    category_id: number;
    category: Category;
    type: 'income' | 'expense';
    amount: number;
    occurred_at: string;
    description: string | null;
};

export type TransactionFormValues = {
    category_id: string;
    type: 'income' | 'expense';
    amount: string;
    occurred_at: string;
    description: string;
};

export type TransactionFiltersState = {
    type: 'all' | 'income' | 'expense';
    category_id: string;
    month: string;
};
