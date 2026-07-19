import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    amountToCurrencyDigits,
    currencyDigitsToAmount,
    formatCurrency,
    formatCurrencyMaskFromDigits,
} from '@/features/fixed-expenses/format';
import type { FixedExpenseOccurrence } from '@/features/fixed-expenses/types';
import { cn } from '@/lib/utils';

type AmountCellProps = {
    occurrence: FixedExpenseOccurrence;
    onAdjustAmount: (occurrence: FixedExpenseOccurrence, amount: number) => void;
    className?: string;
};

export function AmountCell({
    occurrence,
    onAdjustAmount,
    className,
}: AmountCellProps) {
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
            <span
                className={cn(
                    'font-medium text-muted-foreground line-through tabular-nums',
                    className,
                )}
            >
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
                    className,
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
            className={cn('h-8 w-32 text-right tabular-nums', className)}
            aria-label="Valor previsto"
        />
    );
}
