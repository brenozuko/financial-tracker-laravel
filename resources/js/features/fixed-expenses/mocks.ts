import type { Category } from '@/features/categories/types';
import type {
    FixedExpense,
    FixedExpenseOccurrence,
    RecurrenceType,
} from '@/features/fixed-expenses/types';

export const MOCK_CATEGORIES: Category[] = [
    {
        id: 1,
        user_id: 1,
        name: 'Housing',
        color: '#3b82f6',
        icon: 'house',
        sort_order: 0,
    },
    {
        id: 2,
        user_id: 1,
        name: 'Health',
        color: '#22c55e',
        icon: 'heart-pulse',
        sort_order: 1,
    },
    {
        id: 3,
        user_id: 1,
        name: 'Subscriptions',
        color: '#f97316',
        icon: 'repeat',
        sort_order: 2,
    },
    {
        id: 4,
        user_id: 1,
        name: 'Other',
        color: '#6b7280',
        icon: 'circle-ellipsis',
        sort_order: 3,
    },
    {
        id: 5,
        user_id: 1,
        name: 'Leisure',
        color: '#8b5cf6',
        icon: 'gamepad-2',
        sort_order: 4,
    },
];

function findCategory(id: number): Category {
    const category = MOCK_CATEGORIES.find((c) => c.id === id);

    if (!category) {
        throw new Error(`Mock category ${id} not found`);
    }

    return category;
}

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

function shiftDays(isoDate: string, days: number): string {
    const date = new Date(`${isoDate}T00:00:00`);
    date.setDate(date.getDate() + days);

    return date.toISOString().slice(0, 10);
}

function buildBiweeklyAnchor(daysAgo: number): string {
    return shiftDays(todayIsoDate(), -daysAgo);
}

const MOCK_FIXED_EXPENSES_BASE: Omit<FixedExpense, 'category'>[] = [
    {
        id: 1,
        user_id: 1,
        name: 'Aluguel',
        provider_name: 'Imobili\u00e1ria Central',
        category_id: 1,
        default_amount: 2200,
        recurrence_type: 'monthly',
        day_of_month: 5,
        day_of_week: null,
        anchor_date: null,
        is_active: true,
        sort_order: 0,
    },
    {
        id: 2,
        user_id: 1,
        name: 'Internet',
        provider_name: 'Vivo Fibra',
        category_id: 1,
        default_amount: 129.9,
        recurrence_type: 'monthly',
        day_of_month: 20,
        day_of_week: null,
        anchor_date: null,
        is_active: true,
        sort_order: 1,
    },
    {
        id: 3,
        user_id: 1,
        name: 'Cart\u00e3o de cr\u00e9dito',
        provider_name: 'Nubank',
        category_id: 4,
        default_amount: 1800,
        recurrence_type: 'monthly',
        day_of_month: 10,
        day_of_week: null,
        anchor_date: null,
        is_active: true,
        sort_order: 2,
    },
    {
        id: 4,
        user_id: 1,
        name: 'Psic\u00f3loga',
        provider_name: 'Dra. Camila Souza',
        category_id: 2,
        default_amount: 220,
        recurrence_type: 'biweekly',
        day_of_month: null,
        day_of_week: null,
        anchor_date: buildBiweeklyAnchor(8),
        is_active: true,
        sort_order: 3,
    },
    {
        id: 5,
        user_id: 1,
        name: 'Faxina',
        provider_name: 'Maria',
        category_id: 1,
        default_amount: 180,
        recurrence_type: 'biweekly',
        day_of_month: null,
        day_of_week: null,
        anchor_date: buildBiweeklyAnchor(2),
        is_active: true,
        sort_order: 4,
    },
    {
        id: 6,
        user_id: 1,
        name: 'Academia',
        provider_name: 'Smart Fit',
        category_id: 5,
        default_amount: 119.9,
        recurrence_type: 'weekly',
        day_of_month: null,
        day_of_week: 1,
        anchor_date: null,
        is_active: false,
        sort_order: 5,
    },
];

export const MOCK_FIXED_EXPENSES: FixedExpense[] = MOCK_FIXED_EXPENSES_BASE.map(
    (expense) => ({
        ...expense,
        category: findCategory(expense.category_id),
    }),
);

function clampDayOfMonth(year: number, monthIndex: number, day: number): Date {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const safeDay = Math.min(day, lastDay);

    return new Date(year, monthIndex, safeDay);
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function startOfMonth(year: number, monthIndex: number): Date {
    return new Date(year, monthIndex, 1);
}

function endOfMonth(year: number, monthIndex: number): Date {
    return new Date(year, monthIndex + 1, 0);
}

function generateMonthlyDates(
    expense: FixedExpense,
    year: number,
    monthIndex: number,
): string[] {
    if (!expense.day_of_month) {
        return [];
    }

    return [toIsoDate(clampDayOfMonth(year, monthIndex, expense.day_of_month))];
}

function generateWeeklyDates(
    expense: FixedExpense,
    year: number,
    monthIndex: number,
): string[] {
    if (expense.day_of_week === null || expense.day_of_week === undefined) {
        return [];
    }

    const start = startOfMonth(year, monthIndex);
    const end = endOfMonth(year, monthIndex);
    const dates: string[] = [];
    const cursor = new Date(start);
    const offset = (expense.day_of_week - cursor.getDay() + 7) % 7;
    cursor.setDate(cursor.getDate() + offset);

    while (cursor <= end) {
        dates.push(toIsoDate(cursor));
        cursor.setDate(cursor.getDate() + 7);
    }

    return dates;
}

function generateBiweeklyDates(
    expense: FixedExpense,
    year: number,
    monthIndex: number,
): string[] {
    if (!expense.anchor_date) {
        return [];
    }

    const anchor = new Date(`${expense.anchor_date}T00:00:00`);
    const start = startOfMonth(year, monthIndex);
    const end = endOfMonth(year, monthIndex);

    let cursor = new Date(anchor);

    if (cursor > end) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.ceil(
            (cursor.getTime() - end.getTime()) / msPerDay,
        );
        const stepsBackward = Math.ceil(diffDays / 14);
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() - stepsBackward * 14);
    } else {
        while (cursor < start) {
            cursor.setDate(cursor.getDate() + 14);
        }
    }

    const dates: string[] = [];

    while (cursor <= end) {
        if (cursor >= start) {
            dates.push(toIsoDate(cursor));
        }

        cursor.setDate(cursor.getDate() + 14);
    }

    return dates;
}

function generateDatesForMonth(
    expense: FixedExpense,
    year: number,
    monthIndex: number,
): string[] {
    const generators: Record<
        RecurrenceType,
        (expense: FixedExpense, year: number, monthIndex: number) => string[]
    > = {
        monthly: generateMonthlyDates,
        weekly: generateWeeklyDates,
        biweekly: generateBiweeklyDates,
    };

    return generators[expense.recurrence_type](expense, year, monthIndex);
}

let occurrenceIdSeed = 0;

export function nextOccurrenceId(): number {
    occurrenceIdSeed += 1;

    return occurrenceIdSeed;
}

/**
 * Generate occurrences for the given expenses across the current month and
 * the next `monthsAhead` months. Mirrors the eventual server-side generator,
 * so the UI can be wired to real data with no shape changes.
 */
export function generateMockOccurrences(
    expenses: FixedExpense[],
    monthsAhead: number = 1,
): FixedExpenseOccurrence[] {
    const today = new Date();
    const occurrences: FixedExpenseOccurrence[] = [];
    const todayIso = todayIsoDate();

    for (const expense of expenses) {
        if (!expense.is_active) {
            continue;
        }

        for (let offset = 0; offset <= monthsAhead; offset += 1) {
            const target = new Date(
                today.getFullYear(),
                today.getMonth() + offset,
                1,
            );
            const dates = generateDatesForMonth(
                expense,
                target.getFullYear(),
                target.getMonth(),
            );

            for (const dueDate of dates) {
                const id = nextOccurrenceId();
                const isPastDue = dueDate < todayIso;
                const isPaid = isPastDue && Math.random() < 0.55;

                occurrences.push({
                    id,
                    fixed_expense_id: expense.id,
                    fixed_expense: expense,
                    due_date: dueDate,
                    expected_amount: expense.default_amount,
                    paid_amount: isPaid ? expense.default_amount : null,
                    paid_at: isPaid ? `${dueDate}T10:00:00.000Z` : null,
                    notes: null,
                });
            }
        }
    }

    return occurrences.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

/**
 * Generate occurrences for a single expense across the current month and
 * the next `monthsAhead` months. Used when a new expense is created in the UI
 * so we can populate its initial occurrences without re-running the global
 * generator (which would duplicate IDs).
 */
export function generateOccurrencesForExpense(
    expense: FixedExpense,
    monthsAhead: number = 1,
): FixedExpenseOccurrence[] {
    if (!expense.is_active) {
        return [];
    }

    const today = new Date();
    const occurrences: FixedExpenseOccurrence[] = [];

    for (let offset = 0; offset <= monthsAhead; offset += 1) {
        const target = new Date(
            today.getFullYear(),
            today.getMonth() + offset,
            1,
        );
        const dates = generateDatesForMonth(
            expense,
            target.getFullYear(),
            target.getMonth(),
        );

        for (const dueDate of dates) {
            occurrences.push({
                id: nextOccurrenceId(),
                fixed_expense_id: expense.id,
                fixed_expense: expense,
                due_date: dueDate,
                expected_amount: expense.default_amount,
                paid_amount: null,
                paid_at: null,
                notes: null,
            });
        }
    }

    return occurrences;
}

/**
 * Generate occurrences for a single expense in a specific month (YYYY-MM).
 */
export function generateOccurrencesForMonthKey(
    expense: FixedExpense,
    targetMonthKey: string,
): FixedExpenseOccurrence[] {
    if (!expense.is_active) {
        return [];
    }

    const [yearStr, monthStr] = targetMonthKey.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
        return [];
    }

    const dates = generateDatesForMonth(expense, year, monthIndex);

    return dates.map((dueDate) => ({
        id: nextOccurrenceId(),
        fixed_expense_id: expense.id,
        fixed_expense: expense,
        due_date: dueDate,
        expected_amount: expense.default_amount,
        paid_amount: null,
        paid_at: null,
        notes: null,
    }));
}

let expenseIdSeed = MOCK_FIXED_EXPENSES.reduce(
    (acc, expense) => Math.max(acc, expense.id),
    0,
);

export function nextExpenseId(): number {
    expenseIdSeed += 1;

    return expenseIdSeed;
}
