import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@/features/categories/types';
import { FixedExpenseCreateDialog } from '@/features/fixed-expenses/components/fixed-expense-create-dialog';
import { FixedExpenseEditDialog } from '@/features/fixed-expenses/components/fixed-expense-edit-dialog';
import { FixedExpenseFlashMessages } from '@/features/fixed-expenses/components/fixed-expense-flash-messages';
import { FixedExpensesHeader } from '@/features/fixed-expenses/components/fixed-expenses-header';
import { FixedExpensesTable } from '@/features/fixed-expenses/components/fixed-expenses-table';
import { MarkAsPaidDialog } from '@/features/fixed-expenses/components/mark-as-paid-dialog';
import { todayIsoDate } from '@/features/fixed-expenses/format';
import {
    generateMockOccurrences,
    generateOccurrencesForExpense,
    generateOccurrencesForMonthKey,
    MOCK_CATEGORIES,
    MOCK_FIXED_EXPENSES,
    nextExpenseId,
} from '@/features/fixed-expenses/mocks';
import type {
    FixedExpense,
    FixedExpenseFormValues,
    FixedExpenseOccurrence,
    MarkAsPaidFormValues,
    RecurrenceType,
} from '@/features/fixed-expenses/types';
import { fixedExpenses } from '@/routes';

type FixedExpensesPageProps = {
    fixedExpenses?: FixedExpense[];
    occurrences?: FixedExpenseOccurrence[];
    categories?: Category[];
};

const EMPTY_FORM: FixedExpenseFormValues = {
    name: '',
    provider_name: '',
    category_id: '',
    default_amount: '',
    recurrence_type: 'monthly',
    day_of_month: '',
    day_of_week: '',
    anchor_date: '',
    is_active: true,
};

function expenseToFormValues(expense: FixedExpense): FixedExpenseFormValues {
    return {
        name: expense.name,
        provider_name: expense.provider_name ?? '',
        category_id: String(expense.category_id),
        default_amount: expense.default_amount.toFixed(2),
        recurrence_type: expense.recurrence_type,
        day_of_month: expense.day_of_month ? String(expense.day_of_month) : '',
        day_of_week:
            expense.day_of_week !== null && expense.day_of_week !== undefined
                ? String(expense.day_of_week)
                : '',
        anchor_date: expense.anchor_date ?? '',
        is_active: expense.is_active,
    };
}

function findCategory(
    categories: Category[],
    id: number,
): Category | undefined {
    return categories.find((c) => c.id === id);
}

function buildExpenseFromForm(
    base: Omit<FixedExpense, 'category'>,
    values: FixedExpenseFormValues,
    categories: Category[],
): FixedExpense | null {
    const categoryId = Number(values.category_id);
    const category = findCategory(categories, categoryId);

    if (!category) {
        return null;
    }

    const recurrenceType = values.recurrence_type as RecurrenceType;
    const amount = Number(values.default_amount.replace(',', '.'));

    return {
        ...base,
        name: values.name.trim(),
        provider_name: values.provider_name.trim() || null,
        category_id: categoryId,
        category,
        default_amount: Number.isFinite(amount) ? amount : 0,
        recurrence_type: recurrenceType,
        day_of_month:
            recurrenceType === 'monthly' && values.day_of_month
                ? Number(values.day_of_month)
                : null,
        day_of_week:
            recurrenceType === 'weekly' && values.day_of_week !== ''
                ? Number(values.day_of_week)
                : null,
        anchor_date:
            recurrenceType === 'biweekly' && values.anchor_date
                ? values.anchor_date
                : null,
        is_active: base.is_active,
    };
}

function validateForm(
    values: FixedExpenseFormValues,
): Partial<Record<keyof FixedExpenseFormValues, string>> {
    const errors: Partial<Record<keyof FixedExpenseFormValues, string>> = {};

    if (!values.name.trim()) {
        errors.name = 'Informe um nome.';
    }

    if (!values.category_id) {
        errors.category_id = 'Selecione uma categoria.';
    }

    const amount = Number(values.default_amount.replace(',', '.'));

    if (!Number.isFinite(amount) || amount < 0) {
        errors.default_amount = 'Informe um valor v\u00e1lido.';
    }

    if (values.recurrence_type === 'monthly') {
        const day = Number(values.day_of_month);

        if (!Number.isFinite(day) || day < 1 || day > 31) {
            errors.day_of_month = 'Escolha um dia entre 1 e 31.';
        }
    }

    if (values.recurrence_type === 'weekly' && values.day_of_week === '') {
        errors.day_of_week = 'Selecione um dia da semana.';
    }

    if (values.recurrence_type === 'biweekly' && !values.anchor_date) {
        errors.anchor_date = 'Informe a data da primeira ocorr\u00eancia.';
    }

    return errors;
}

export default function FixedExpensesIndex({
    fixedExpenses: initialExpenses,
    occurrences: initialOccurrences,
    categories: initialCategories,
}: FixedExpensesPageProps) {
    const [categories] = useState<Category[]>(
        initialCategories && initialCategories.length > 0
            ? initialCategories
            : MOCK_CATEGORIES,
    );
    const [expenses, setExpenses] = useState<FixedExpense[]>(
        initialExpenses && initialExpenses.length > 0
            ? initialExpenses
            : MOCK_FIXED_EXPENSES,
    );
    const [occurrences, setOccurrences] = useState<FixedExpenseOccurrence[]>(
        () =>
            initialOccurrences && initialOccurrences.length > 0
                ? initialOccurrences
                : generateMockOccurrences(MOCK_FIXED_EXPENSES, 1),
    );

    const [createOpen, setCreateOpen] = useState(false);
    const [createValues, setCreateValues] =
        useState<FixedExpenseFormValues>(EMPTY_FORM);
    const [createErrors, setCreateErrors] = useState<
        Partial<Record<keyof FixedExpenseFormValues, string>>
    >({});

    const [editing, setEditing] = useState<FixedExpense | null>(null);
    const [editValues, setEditValues] =
        useState<FixedExpenseFormValues>(EMPTY_FORM);
    const [editErrors, setEditErrors] = useState<
        Partial<Record<keyof FixedExpenseFormValues, string>>
    >({});

    const [paying, setPaying] = useState<FixedExpenseOccurrence | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() =>
        todayIsoDate().slice(0, 7),
    );
    const [skippedKeys, setSkippedKeys] = useState<Set<string>>(
        () => new Set(),
    );
    const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!flashSuccess) {
            return;
        }

        const handle = window.setTimeout(() => setFlashSuccess(null), 4000);

        return () => window.clearTimeout(handle);
    }, [flashSuccess]);

    const expensesById = useMemo(() => {
        const map = new Map<number, FixedExpense>();

        for (const expense of expenses) {
            map.set(expense.id, expense);
        }

        return map;
    }, [expenses]);

    const displayOccurrences = useMemo(() => {
        const byKey = new Map<string, FixedExpenseOccurrence>();

        for (const occurrence of occurrences) {
            const expense = expensesById.get(occurrence.fixed_expense_id);
            const enriched = expense
                ? { ...occurrence, fixed_expense: expense }
                : occurrence;
            byKey.set(
                `${occurrence.fixed_expense_id}-${occurrence.due_date}`,
                enriched,
            );
        }

        for (const expense of expenses) {
            if (!expense.is_active) {
                continue;
            }

            const generated = generateOccurrencesForMonthKey(
                expense,
                selectedMonth,
            );

            for (const occurrence of generated) {
                const key = `${occurrence.fixed_expense_id}-${occurrence.due_date}`;

                if (!byKey.has(key)) {
                    byKey.set(key, { ...occurrence, fixed_expense: expense });
                }
            }
        }

        return Array.from(byKey.values()).filter(
            (occurrence) =>
                !skippedKeys.has(
                    `${occurrence.fixed_expense_id}-${occurrence.due_date}`,
                ),
        );
    }, [occurrences, expenses, expensesById, selectedMonth, skippedKeys]);

    const openCreate = () => {
        setCreateValues(EMPTY_FORM);
        setCreateErrors({});
        setCreateOpen(true);
    };

    const openEdit = (expense: FixedExpense) => {
        setEditValues(expenseToFormValues(expense));
        setEditErrors({});
        setEditing(expense);
    };

    const updateCreateField = <K extends keyof FixedExpenseFormValues>(
        field: K,
        value: FixedExpenseFormValues[K],
    ) => {
        setCreateValues((prev) => ({ ...prev, [field]: value }));
    };

    const updateEditField = <K extends keyof FixedExpenseFormValues>(
        field: K,
        value: FixedExpenseFormValues[K],
    ) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(createValues);

        if (Object.keys(errors).length > 0) {
            setCreateErrors(errors);

            return;
        }

        const newId = nextExpenseId();
        const sortOrder = expenses.length;
        const newExpense = buildExpenseFromForm(
            {
                id: newId,
                user_id: 1,
                name: '',
                provider_name: null,
                category_id: 0,
                default_amount: 0,
                recurrence_type: 'monthly',
                day_of_month: null,
                day_of_week: null,
                anchor_date: null,
                is_active: true,
                sort_order: sortOrder,
            } as FixedExpense,
            createValues,
            categories,
        );

        if (!newExpense) {
            return;
        }

        const newOccurrences = generateOccurrencesForExpense(newExpense, 1);

        setExpenses((prev) => [...prev, newExpense]);
        setOccurrences((prev) => [...prev, ...newOccurrences]);
        setCreateOpen(false);
        setFlashSuccess(`Conta fixa "${newExpense.name}" criada.`);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editing) {
            return;
        }

        const errors = validateForm(editValues);

        if (Object.keys(errors).length > 0) {
            setEditErrors(errors);

            return;
        }

        const updated = buildExpenseFromForm(editing, editValues, categories);

        if (!updated) {
            return;
        }

        setExpenses((prev) =>
            prev.map((expense) =>
                expense.id === updated.id ? updated : expense,
            ),
        );

        setOccurrences((prev) => {
            const remaining = prev.filter(
                (occurrence) =>
                    occurrence.fixed_expense_id !== updated.id ||
                    occurrence.paid_at !== null,
            );
            const regenerated = updated.is_active
                ? generateOccurrencesForExpense(updated, 1).filter(
                      (occurrence) =>
                          !remaining.some(
                              (existing) =>
                                  existing.fixed_expense_id ===
                                      occurrence.fixed_expense_id &&
                                  existing.due_date === occurrence.due_date,
                          ),
                  )
                : [];

            return [...remaining, ...regenerated];
        });

        setEditing(null);
        setFlashSuccess(`Conta fixa "${updated.name}" atualizada.`);
    };

    const handleDelete = (expense: FixedExpense) => {
        if (
            !window.confirm(
                `Tem certeza que deseja excluir "${expense.name}"? Ocorr\u00eancias n\u00e3o pagas tamb\u00e9m ser\u00e3o removidas.`,
            )
        ) {
            return;
        }

        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        setOccurrences((prev) =>
            prev.filter(
                (occurrence) =>
                    occurrence.fixed_expense_id !== expense.id ||
                    occurrence.paid_at !== null,
            ),
        );
        setFlashSuccess(`Conta fixa "${expense.name}" exclu\u00edda.`);
    };

    const handleToggleActive = (expense: FixedExpense) => {
        const next = { ...expense, is_active: !expense.is_active };

        setExpenses((prev) =>
            prev.map((e) => (e.id === expense.id ? next : e)),
        );

        setOccurrences((prev) => {
            const kept = prev.filter(
                (occurrence) =>
                    occurrence.fixed_expense_id !== expense.id ||
                    occurrence.paid_at !== null,
            );

            if (next.is_active) {
                const generated = generateOccurrencesForExpense(next, 1).filter(
                    (occurrence) =>
                        !kept.some(
                            (existing) =>
                                existing.fixed_expense_id ===
                                    occurrence.fixed_expense_id &&
                                existing.due_date === occurrence.due_date,
                        ),
                );

                return [...kept, ...generated];
            }

            return kept;
        });

        setFlashSuccess(
            next.is_active
                ? `"${expense.name}" reativada.`
                : `"${expense.name}" pausada.`,
        );
    };

    const handleAdjustAmount = (
        occurrence: FixedExpenseOccurrence,
        amount: number,
    ) => {
        setOccurrences((prev) => {
            const index = prev.findIndex(
                (o) =>
                    o.id === occurrence.id ||
                    (o.fixed_expense_id === occurrence.fixed_expense_id &&
                        o.due_date === occurrence.due_date),
            );

            if (index >= 0) {
                return prev.map((o, i) =>
                    i === index ? { ...o, expected_amount: amount } : o,
                );
            }

            return [...prev, { ...occurrence, expected_amount: amount }];
        });
    };

    const handleSkip = (occurrence: FixedExpenseOccurrence) => {
        if (
            !window.confirm(
                `Pular o vencimento de "${occurrence.fixed_expense.name}" desta data?`,
            )
        ) {
            return;
        }

        const key = `${occurrence.fixed_expense_id}-${occurrence.due_date}`;

        setSkippedKeys((prev) => new Set(prev).add(key));
        setOccurrences((prev) =>
            prev.filter(
                (o) => `${o.fixed_expense_id}-${o.due_date}` !== key,
            ),
        );
        setFlashSuccess('Ocorr\u00eancia pulada.');
    };

    const handleConfirmPayment = async (
        occurrence: FixedExpenseOccurrence,
        values: MarkAsPaidFormValues,
    ) => {
        await new Promise((resolve) => window.setTimeout(resolve, 250));

        const paidAmount = Number(values.paid_amount.replace(',', '.'));
        const paidAt = `${values.paid_at}T12:00:00.000Z`;
        const updated: FixedExpenseOccurrence = {
            ...occurrence,
            paid_amount: Number.isFinite(paidAmount)
                ? paidAmount
                : occurrence.expected_amount,
            paid_at: paidAt,
            notes: values.description || occurrence.notes,
        };

        setOccurrences((prev) => {
            const index = prev.findIndex(
                (o) =>
                    o.id === occurrence.id ||
                    (o.fixed_expense_id === occurrence.fixed_expense_id &&
                        o.due_date === occurrence.due_date),
            );

            if (index >= 0) {
                return prev.map((o, i) => (i === index ? updated : o));
            }

            return [...prev, updated];
        });

        setFlashSuccess(
            `Pagamento de "${occurrence.fixed_expense.name}" registrado. Transa\u00e7\u00e3o gerada (mock).`,
        );
    };

    return (
        <>
            <Head title="Contas fixas" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <FixedExpenseFlashMessages success={flashSuccess} />
                <FixedExpensesHeader onNewFixedExpense={openCreate} />

                <FixedExpensesTable
                    occurrences={displayOccurrences}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    onAdjustAmount={handleAdjustAmount}
                    onMarkAsPaid={(occurrence) => setPaying(occurrence)}
                    onSkip={handleSkip}
                    onEditExpense={openEdit}
                    onDeleteExpense={handleDelete}
                    onToggleActive={handleToggleActive}
                />
            </div>

            <FixedExpenseCreateDialog
                categories={categories}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
                onCancel={() => setCreateOpen(false)}
                values={createValues}
                errors={createErrors}
                onFieldChange={updateCreateField}
                processing={false}
            />

            <FixedExpenseEditDialog
                categories={categories}
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                onSubmit={handleEdit}
                onCancel={() => setEditing(null)}
                values={editValues}
                errors={editErrors}
                onFieldChange={updateEditField}
                processing={false}
            />

            <MarkAsPaidDialog
                occurrence={paying}
                open={paying !== null}
                onOpenChange={(open) => !open && setPaying(null)}
                onConfirm={handleConfirmPayment}
            />
        </>
    );
}

FixedExpensesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Contas fixas',
            href: fixedExpenses(),
        },
    ],
};
