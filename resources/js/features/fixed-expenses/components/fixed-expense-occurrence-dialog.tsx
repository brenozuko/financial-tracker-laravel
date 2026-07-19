import { Check, Pause, Pencil, Play, SkipForward, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import { AmountCell } from '@/features/fixed-expenses/components/amount-cell';
import { OccurrenceStatusBadge } from '@/features/fixed-expenses/components/occurrence-status-badge';
import {
    deriveOccurrenceStatus,
    formatLongDate,
    recurrenceLabel,
} from '@/features/fixed-expenses/format';
import type {
    FixedExpense,
    FixedExpenseOccurrence,
} from '@/features/fixed-expenses/types';

type FixedExpenseOccurrenceDialogProps = {
    occurrence: FixedExpenseOccurrence;
    windowDays: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
    onSkip: (occurrence: FixedExpenseOccurrence) => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (expense: FixedExpense) => void;
    onToggleActive: (expense: FixedExpense) => void;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

export function FixedExpenseOccurrenceDialog({
    occurrence,
    windowDays,
    open,
    onOpenChange,
    onAdjustAmount,
    onMarkAsPaid,
    onSkip,
    onEditExpense,
    onDeleteExpense,
    onToggleActive,
}: FixedExpenseOccurrenceDialogProps) {
    const expense = occurrence.fixed_expense;
    const status = deriveOccurrenceStatus(occurrence, windowDays);
    const isPaid = status === 'paid';

    const close = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span
                            className="size-3 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: expense.category.color }}
                            aria-hidden
                        />
                        <span className="truncate">{expense.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <OccurrenceStatusBadge status={status} />
                        {!expense.is_active && (
                            <span className="text-xs text-muted-foreground">
                                Conta pausada
                            </span>
                        )}
                    </div>

                    <Separator />

                    <DetailRow
                        label="Vencimento"
                        value={formatLongDate(occurrence.due_date)}
                    />
                    <DetailRow
                        label="Categoria"
                        value={
                            <span className="flex items-center justify-end gap-1.5">
                                <CategoryIcon
                                    name={expense.category.icon}
                                    className="size-4 text-muted-foreground"
                                />
                                {expense.category.name}
                            </span>
                        }
                    />
                    <DetailRow
                        label="Ciclo"
                        value={recurrenceLabel(expense.recurrence_type)}
                    />
                    {expense.provider_name && (
                        <DetailRow
                            label="Prestador"
                            value={expense.provider_name}
                        />
                    )}
                    <DetailRow
                        label="Valor previsto"
                        value={
                            <AmountCell
                                occurrence={occurrence}
                                onAdjustAmount={onAdjustAmount}
                            />
                        }
                    />

                    <Separator />

                    <div className="grid gap-2">
                        {!isPaid && (
                            <Button
                                type="button"
                                onClick={() => {
                                    close();
                                    onMarkAsPaid(occurrence);
                                }}
                            >
                                <Check className="size-4" />
                                Marcar como paga
                            </Button>
                        )}
                        {!isPaid && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    close();
                                    onSkip(occurrence);
                                }}
                            >
                                <SkipForward className="size-4" />
                                Pular ocorrência
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                close();
                                onEditExpense(expense);
                            }}
                        >
                            <Pencil className="size-4" />
                            Editar conta
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                close();
                                onToggleActive(expense);
                            }}
                        >
                            {expense.is_active ? (
                                <>
                                    <Pause className="size-4" />
                                    Pausar conta
                                </>
                            ) : (
                                <>
                                    <Play className="size-4" />
                                    Reativar conta
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                                close();
                                onDeleteExpense(expense);
                            }}
                        >
                            <Trash2 className="size-4" />
                            Excluir conta
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
