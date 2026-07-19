import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, Check } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import {
    daysBetween,
    formatCurrency,
    formatShortDate,
    monthKey,
    statusBadgeClassName,
    statusLabel,
    todayIsoDate,
} from '@/features/fixed-expenses/format';
import type {
    FixedExpenseOccurrence,
    OccurrenceStatus,
} from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';
import { fixedExpenses } from '@/routes';

type UpcomingBillsProps = {
    bills?: FixedExpenseOccurrence[];
    windowDays: number;
    onWindowDaysChange: (days: number) => void;
    onMarkAsPaid: (occurrence: FixedExpenseOccurrence) => void;
};

type GroupedBills = {
    status: OccurrenceStatus;
    items: FixedExpenseOccurrence[];
};

const WINDOW_OPTIONS: { value: string; label: string }[] = [
    { value: '3', label: '3 dias' },
    { value: '5', label: '5 dias' },
    { value: '7', label: '7 dias' },
];

function classify(
    occurrence: FixedExpenseOccurrence,
    windowDays: number,
    today: string,
    currentMonth: string,
): OccurrenceStatus | null {
    if (occurrence.paid_at) {
        return null;
    }

    if (occurrence.due_date < today) {
        return 'overdue';
    }

    const diff = daysBetween(today, occurrence.due_date);

    if (diff <= windowDays) {
        return 'within_window';
    }

    if (monthKey(occurrence.due_date) === currentMonth) {
        return 'scheduled';
    }

    return null;
}

function groupBills(
    bills: FixedExpenseOccurrence[],
    windowDays: number,
): GroupedBills[] {
    const today = todayIsoDate();
    const currentMonth = monthKey(today);
    const buckets: Record<OccurrenceStatus, FixedExpenseOccurrence[]> = {
        paid: [],
        overdue: [],
        within_window: [],
        scheduled: [],
    };

    for (const bill of bills) {
        const status = classify(bill, windowDays, today, currentMonth);

        if (status) {
            buckets[status].push(bill);
        }
    }

    const order: OccurrenceStatus[] = ['overdue', 'within_window', 'scheduled'];

    return order
        .map<GroupedBills>((status) => ({
            status,
            items: buckets[status].sort((a, b) =>
                a.due_date.localeCompare(b.due_date),
            ),
        }))
        .filter((group) => group.items.length > 0);
}

function groupTitle(status: OccurrenceStatus, windowDays: number): string {
    switch (status) {
        case 'overdue':
            return 'Atrasadas';
        case 'within_window':
            return `Pr\u00f3ximos ${windowDays} dias`;
        case 'scheduled':
        default:
            return 'Programadas neste m\u00eas';
    }
}

export function UpcomingBills({
    bills,
    windowDays,
    onWindowDaysChange,
    onMarkAsPaid,
}: UpcomingBillsProps) {
    const groups = useMemo(
        () => (bills ? groupBills(bills, windowDays) : []),
        [bills, windowDays],
    );

    const isLoading = bills === undefined;

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">
                    Próximos vencimentos
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Select
                        value={String(windowDays)}
                        onValueChange={(v) => onWindowDaysChange(Number(v))}
                    >
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {WINDOW_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Link
                        href={fixedExpenses()}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        prefetch
                    >
                        Ver todas
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid gap-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton
                                key={idx}
                                className="h-14 w-full rounded-lg"
                            />
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <CalendarCheck className="size-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Nenhuma conta fixa pendente.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {groups.map((group) => (
                            <div key={group.status} className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs',
                                            statusBadgeClassName(group.status),
                                        )}
                                    >
                                        {statusLabel(group.status)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {groupTitle(group.status, windowDays)}
                                    </span>
                                </div>
                                <ul className="divide-y divide-border rounded-lg border border-border">
                                    {group.items.map((bill) => (
                                        <li
                                            key={bill.id}
                                            className="flex flex-wrap items-center gap-3 px-3 py-2"
                                        >
                                            <span
                                                className="size-3.5 shrink-0 rounded-full border border-border"
                                                style={{
                                                    backgroundColor:
                                                        bill.fixed_expense
                                                            .category.color,
                                                }}
                                                aria-hidden
                                            />
                                            <CategoryIcon
                                                name={
                                                    bill.fixed_expense.category
                                                        .icon
                                                }
                                                className="size-4 shrink-0 text-muted-foreground"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {bill.fixed_expense.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatShortDate(
                                                        bill.due_date,
                                                    )}
                                                    {bill.fixed_expense
                                                        .provider_name
                                                        ? ` · ${bill.fixed_expense.provider_name}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-semibold">
                                                {formatCurrency(
                                                    bill.expected_amount,
                                                )}
                                            </span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    onMarkAsPaid(bill)
                                                }
                                            >
                                                <Check className="mr-1 size-4" />
                                                Pagar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
