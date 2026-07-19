import {
    Check,
    MoreVertical,
    Pause,
    Pencil,
    Play,
    SkipForward,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
    FixedExpense,
    FixedExpenseOccurrence,
} from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';

type OccurrenceActionsProps = {
    occurrence: FixedExpenseOccurrence;
    isPaid: boolean;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
    onSkip: (occurrence: FixedExpenseOccurrence) => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (expense: FixedExpense) => void;
    onToggleActive: (expense: FixedExpense) => void;
    payLabelMode?: 'visible' | 'compact';
};

export function OccurrenceActions({
    occurrence,
    isPaid,
    onMarkAsPaid,
    onSkip,
    onEditExpense,
    onDeleteExpense,
    onToggleActive,
    payLabelMode = 'compact',
}: OccurrenceActionsProps) {
    const expense = occurrence.fixed_expense;

    return (
        <div className="flex items-center justify-end gap-1">
            {!isPaid && (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsPaid(occurrence)}
                >
                    <Check className="size-4" />
                    <span
                        className={cn(
                            payLabelMode === 'visible'
                                ? 'ml-1'
                                : 'sr-only sm:not-sr-only sm:ml-1',
                        )}
                    >
                        Pagar
                    </span>
                </Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Mais ações"
                    >
                        <MoreVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {!isPaid && (
                        <DropdownMenuItem onSelect={() => onSkip(occurrence)}>
                            <SkipForward className="size-4" />
                            Pular ocorrência
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => onEditExpense(expense)}>
                        <Pencil className="size-4" />
                        Editar conta
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggleActive(expense)}>
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
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDeleteExpense(expense)}
                    >
                        <Trash2 className="size-4" />
                        Excluir conta
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
