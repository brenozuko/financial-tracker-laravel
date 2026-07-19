import type {
    FixedExpenseOccurrence,
    OccurrenceStatus,
    RecurrenceType,
} from '@/features/fixed-expenses/types';

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
    monthly: 'Mensal',
    biweekly: 'Quinzenal',
    weekly: 'Semanal',
};

const WEEKDAY_LABELS: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Ter\u00e7a-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'S\u00e1bado',
};

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'weekly', label: 'Semanal' },
];

export const DAY_OF_WEEK_OPTIONS: { value: string; label: string }[] = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Ter\u00e7a-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'S\u00e1bado' },
];

export const MONTH_OPTIONS: { value: string; label: string }[] = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
];

export function parseMonthKey(value: string): { year: string; month: string } {
    const [year, month] = value.split('-');

    return {
        year: year ?? String(new Date().getFullYear()),
        month: month ?? String(new Date().getMonth() + 1).padStart(2, '0'),
    };
}

export function buildMonthKey(year: string, month: string): string {
    return `${year}-${month.padStart(2, '0')}`;
}

export function getYearOptions(
    selectedYear: string,
    spread = 2,
): { value: string; label: string }[] {
    const current = new Date().getFullYear();
    const years = new Set<number>();

    for (let y = current - spread; y <= current + spread; y += 1) {
        years.add(y);
    }

    years.add(Number(selectedYear));

    return Array.from(years)
        .sort((a, b) => a - b)
        .map((year) => ({
            value: String(year),
            label: String(year),
        }));
}

export function recurrenceLabel(type: RecurrenceType): string {
    return RECURRENCE_LABELS[type];
}

export function weekdayLabel(day: number | null): string {
    if (day === null || day === undefined) {
        return '';
    }

    return WEEKDAY_LABELS[day] ?? '';
}

export {
    amountToCurrencyDigits,
    currencyDigitsToAmount,
    formatCurrency,
    formatCurrencyMaskFromDigits,
} from '@/lib/currency';

export function formatShortDate(isoDate: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    }).format(new Date(`${isoDate}T00:00:00`));
}

export function formatLongDate(isoDate: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(`${isoDate}T00:00:00`));
}

export function formatWeekdayShort(isoDate: string): string {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
        .format(new Date(`${isoDate}T00:00:00`))
        .replace('.', '');
}

export function formatMonthHeading(isoDate: string): string {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${isoDate}T00:00:00`));

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
    const from = new Date(`${fromIso}T00:00:00`);
    const to = new Date(`${toIso}T00:00:00`);
    const diff = to.getTime() - from.getTime();

    return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function monthKey(isoDate: string): string {
    return isoDate.slice(0, 7);
}

export function deriveOccurrenceStatus(
    occurrence: FixedExpenseOccurrence,
    windowDays: number,
    today: string = todayIsoDate(),
): OccurrenceStatus {
    if (occurrence.paid_at) {
        return 'paid';
    }

    if (occurrence.due_date < today) {
        return 'overdue';
    }

    const diff = daysBetween(today, occurrence.due_date);

    if (diff <= windowDays) {
        return 'within_window';
    }

    return 'scheduled';
}

export function statusLabel(status: OccurrenceStatus): string {
    switch (status) {
        case 'paid':
            return 'Paga';
        case 'overdue':
            return 'Atrasada';
        case 'within_window':
            return 'Vencendo';
        case 'scheduled':
        default:
            return 'Programada';
    }
}

export function statusBadgeClassName(status: OccurrenceStatus): string {
    switch (status) {
        case 'paid':
            return 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300';
        case 'overdue':
            return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
        case 'within_window':
            return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200';
        case 'scheduled':
        default:
            return 'border-border bg-muted text-muted-foreground';
    }
}

export function describeRecurrence(
    type: RecurrenceType,
    expense: {
        day_of_month: number | null;
        day_of_week: number | null;
        anchor_date: string | null;
    },
): string {
    if (type === 'monthly' && expense.day_of_month) {
        return `Todo dia ${expense.day_of_month}`;
    }

    if (type === 'weekly' && expense.day_of_week !== null) {
        return `Toda ${weekdayLabel(expense.day_of_week).toLowerCase()}`;
    }

    if (type === 'biweekly' && expense.anchor_date) {
        return `A cada 14 dias (a partir de ${formatLongDate(expense.anchor_date)})`;
    }

    return recurrenceLabel(type);
}
