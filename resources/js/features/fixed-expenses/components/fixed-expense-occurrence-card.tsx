import { useState } from 'react';
import { FixedExpenseOccurrenceDialog } from '@/features/fixed-expenses/components/fixed-expense-occurrence-dialog';
import { OccurrenceStatusBadge } from '@/features/fixed-expenses/components/occurrence-status-badge';
import {
    deriveOccurrenceStatus,
    formatCurrency,
    formatShortDate,
    formatWeekdayShort,
} from '@/features/fixed-expenses/format';
import type {
    FixedExpense,
    FixedExpenseOccurrence,
} from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';

type FixedExpenseOccurrenceCardProps = {
    occurrence: FixedExpenseOccurrence;
    windowDays: number;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
    onSkip: (occurrence: FixedExpenseOccurrence) => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (expense: FixedExpense) => void;
    onToggleActive: (expense: FixedExpense) => void;
};

export function FixedExpenseOccurrenceCard({
    occurrence,
    windowDays,
    onAdjustAmount,
    onMarkAsPaid,
    onSkip,
    onEditExpense,
    onDeleteExpense,
    onToggleActive,
}: FixedExpenseOccurrenceCardProps) {
    const [open, setOpen] = useState(false);
    const expense = occurrence.fixed_expense;
    const status = deriveOccurrenceStatus(occurrence, windowDays);
    const isPaid = status === 'paid';
    const displayAmount = isPaid
        ? (occurrence.paid_amount ?? occurrence.expected_amount)
        : occurrence.expected_amount;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <span
                    className="size-3 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: expense.category.color }}
                    aria-hidden
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {expense.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatShortDate(occurrence.due_date)} ·{' '}
                        {formatWeekdayShort(occurrence.due_date)}
                    </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                        className={cn(
                            'text-sm font-semibold tabular-nums',
                            isPaid && 'text-muted-foreground line-through',
                        )}
                    >
                        {formatCurrency(displayAmount)}
                    </span>
                    <OccurrenceStatusBadge status={status} />
                </div>
            </button>

            <FixedExpenseOccurrenceDialog
                occurrence={occurrence}
                windowDays={windowDays}
                open={open}
                onOpenChange={setOpen}
                onAdjustAmount={onAdjustAmount}
                onMarkAsPaid={onMarkAsPaid}
                onSkip={onSkip}
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
                onToggleActive={onToggleActive}
            />
        </>
    );
}
