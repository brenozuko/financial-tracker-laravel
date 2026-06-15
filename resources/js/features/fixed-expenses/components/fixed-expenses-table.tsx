import {
    CalendarCheck,
    Check,
    MoreVertical,
    Pause,
    Pencil,
    Play,
    SkipForward,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import {
    amountToCurrencyDigits,
    buildMonthKey,
    currencyDigitsToAmount,
    deriveOccurrenceStatus,
    formatCurrency,
    formatCurrencyMaskFromDigits,
    formatMonthHeading,
    formatShortDate,
    formatWeekdayShort,
    getYearOptions,
    monthKey,
    MONTH_OPTIONS,
    parseMonthKey,
    recurrenceLabel,
    statusBadgeClassName,
    statusLabel,
} from '@/features/fixed-expenses/format';
import type {
    FixedExpense,
    FixedExpenseOccurrence,
} from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';

type FixedExpensesTableProps = {
    occurrences: FixedExpenseOccurrence[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    windowDays?: number;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
    onSkip: (occurrence: FixedExpenseOccurrence) => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (expense: FixedExpense) => void;
    onToggleActive: (expense: FixedExpense) => void;
};

type TableRowProps = {
    occurrence: FixedExpenseOccurrence;
    windowDays: number;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
    onSkip: (occurrence: FixedExpenseOccurrence) => void;
    onEditExpense: (expense: FixedExpense) => void;
    onDeleteExpense: (expense: FixedExpense) => void;
    onToggleActive: (expense: FixedExpense) => void;
};

type MonthYearPickerProps = {
    selectedMonth: string;
    onMonthChange: (month: string) => void;
};

function MonthYearPicker({
    selectedMonth,
    onMonthChange,
}: MonthYearPickerProps) {
    const { year, month } = parseMonthKey(selectedMonth);
    const yearOptions = useMemo(
        () => getYearOptions(year),
        [year],
    );

    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
                <Label
                    htmlFor="fixed-expenses-month-select"
                    className="text-xs text-muted-foreground"
                >
                    Mês
                </Label>
                <Select
                    value={month}
                    onValueChange={(nextMonth) =>
                        onMonthChange(buildMonthKey(year, nextMonth))
                    }
                >
                    <SelectTrigger
                        id="fixed-expenses-month-select"
                        className="h-9 w-36"
                    >
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTH_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-1.5">
                <Label
                    htmlFor="fixed-expenses-year-select"
                    className="text-xs text-muted-foreground"
                >
                    Ano
                </Label>
                <Select
                    value={year}
                    onValueChange={(nextYear) =>
                        onMonthChange(buildMonthKey(nextYear, month))
                    }
                >
                    <SelectTrigger
                        id="fixed-expenses-year-select"
                        className="h-9 w-24"
                    >
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {yearOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function AmountCell({
    occurrence,
    onAdjustAmount,
}: {
    occurrence: FixedExpenseOccurrence;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [digits, setDigits] = useState(() =>
        amountToCurrencyDigits(occurrence.expected_amount),
    );
    const [lastSyncedAmount, setLastSyncedAmount] = useState(
        occurrence.expected_amount,
    );
    const inputRef = useRef<HTMLInputElement>(null);

    if (lastSyncedAmount !== occurrence.expected_amount) {
        setLastSyncedAmount(occurrence.expected_amount);
        setDigits(amountToCurrencyDigits(occurrence.expected_amount));
        setIsEditing(false);
    }

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const maskedValue = useMemo(
        () => formatCurrencyMaskFromDigits(digits),
        [digits],
    );

    const startEditing = () => {
        setDigits(amountToCurrencyDigits(occurrence.expected_amount));
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setDigits(amountToCurrencyDigits(occurrence.expected_amount));
        setIsEditing(false);
    };

    const commitAmount = () => {
        const parsed = currencyDigitsToAmount(digits);

        setIsEditing(false);

        if (parsed !== occurrence.expected_amount) {
            onAdjustAmount(occurrence, parsed);
        }
    };

    if (occurrence.paid_at) {
        return (
            <span className="font-medium text-muted-foreground line-through">
                {formatCurrency(
                    occurrence.paid_amount ?? occurrence.expected_amount,
                )}
            </span>
        );
    }

    if (!isEditing) {
        return (
            <button
                type="button"
                onClick={startEditing}
                className={cn(
                    'rounded-md px-2 py-1 text-right font-medium tabular-nums',
                    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                aria-label={`Valor previsto ${formatCurrency(occurrence.expected_amount)}. Clique para editar.`}
            >
                {formatCurrency(occurrence.expected_amount)}
            </button>
        );
    }

    return (
        <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={maskedValue}
            onChange={(e) => {
                setDigits(e.target.value.replace(/\D/g, ''));
            }}
            onBlur={commitAmount}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }

                if (e.key === 'Escape') {
                    cancelEditing();
                }
            }}
            className="h-8 w-32 text-right tabular-nums"
            aria-label="Valor previsto"
        />
    );
}

function TableRow({
    occurrence,
    windowDays,
    onAdjustAmount,
    onMarkAsPaid,
    onSkip,
    onEditExpense,
    onDeleteExpense,
    onToggleActive,
}: TableRowProps) {
    const expense = occurrence.fixed_expense;
    const status = deriveOccurrenceStatus(occurrence, windowDays);
    const isPaid = status === 'paid';

    return (
        <tr className="border-b border-border last:border-0">
            <td className="px-4 py-3 text-sm whitespace-nowrap">
                <div className="font-medium">
                    {formatShortDate(occurrence.due_date)}
                </div>
                <div className="text-xs text-muted-foreground">
                    {formatWeekdayShort(occurrence.due_date)}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: expense.category.color }}
                        aria-hidden
                    />
                    <div className="min-w-0">
                        <p className="truncate font-medium">{expense.name}</p>
                        {!expense.is_active && (
                            <span className="text-xs text-muted-foreground">
                                Pausada
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                {expense.provider_name ?? '—'}
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">
                <div className="flex items-center gap-1.5 text-sm">
                    <CategoryIcon
                        name={expense.category.icon}
                        className="size-4 text-muted-foreground"
                    />
                    <span>{expense.category.name}</span>
                </div>
            </td>
            <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                {recurrenceLabel(expense.recurrence_type)}
            </td>
            <td className="px-4 py-3">
                <AmountCell
                    occurrence={occurrence}
                    onAdjustAmount={onAdjustAmount}
                />
            </td>
            <td className="px-4 py-3">
                <Badge
                    variant="outline"
                    className={cn('text-xs', statusBadgeClassName(status))}
                >
                    {statusLabel(status)}
                </Badge>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    {!isPaid && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onMarkAsPaid(occurrence)}
                        >
                            <Check className="size-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">
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
                                <DropdownMenuItem
                                    onSelect={() => onSkip(occurrence)}
                                >
                                    <SkipForward className="size-4" />
                                    Pular ocorrência
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onSelect={() => onEditExpense(expense)}
                            >
                                <Pencil className="size-4" />
                                Editar conta
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => onToggleActive(expense)}
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
            </td>
        </tr>
    );
}

export function FixedExpensesTable({
    occurrences,
    selectedMonth,
    onMonthChange,
    windowDays = 7,
    onAdjustAmount,
    onMarkAsPaid,
    onSkip,
    onEditExpense,
    onDeleteExpense,
    onToggleActive,
}: FixedExpensesTableProps) {
    const rows = useMemo(
        () =>
            [...occurrences]
                .filter((o) => monthKey(o.due_date) === selectedMonth)
                .sort((a, b) => a.due_date.localeCompare(b.due_date)),
        [occurrences, selectedMonth],
    );

    const summary = useMemo(() => {
        const total = rows.reduce((acc, o) => acc + o.expected_amount, 0);
        const paid = rows
            .filter((o) => o.paid_at)
            .reduce((acc, o) => acc + (o.paid_amount ?? o.expected_amount), 0);
        const pending = rows
            .filter((o) => !o.paid_at)
            .reduce((acc, o) => acc + o.expected_amount, 0);

        return { total, paid, pending };
    }, [rows]);

    const monthLabel = formatMonthHeading(`${selectedMonth}-01`);

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-muted/30 px-4 py-3">
                <MonthYearPicker
                    selectedMonth={selectedMonth}
                    onMonthChange={onMonthChange}
                />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                    <div>
                        <span className="text-muted-foreground">
                            Previsto:{' '}
                        </span>
                        <span className="font-semibold">
                            {formatCurrency(summary.total)}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">A pagar: </span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                            {formatCurrency(summary.pending)}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Pago: </span>
                        <span className="font-semibold text-green-700 dark:text-green-300">
                            {formatCurrency(summary.paid)}
                        </span>
                    </div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CalendarCheck className="size-10 text-muted-foreground/50" />
                    <div>
                        <p className="font-medium text-muted-foreground">
                            Nenhuma ocorrência em {monthLabel}
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                            Cadastre uma conta fixa ou escolha outro mês.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium">
                                    Vencimento
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Conta
                                </th>
                                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                                    Prestador
                                </th>
                                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                                    Categoria
                                </th>
                                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                                    Ciclo
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Valor
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-right font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((occurrence) => (
                                <TableRow
                                    key={occurrence.id}
                                    occurrence={occurrence}
                                    windowDays={windowDays}
                                    onAdjustAmount={onAdjustAmount}
                                    onMarkAsPaid={onMarkAsPaid}
                                    onSkip={onSkip}
                                    onEditExpense={onEditExpense}
                                    onDeleteExpense={onDeleteExpense}
                                    onToggleActive={onToggleActive}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
