import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    amountToCurrencyDigits,
    currencyDigitsToAmount,
    formatCurrencyMaskFromDigits,
} from '@/lib/currency';

type CurrencyInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'value' | 'onChange' | 'type' | 'inputMode'
> & {
    value: string;
    onValueChange: (value: string) => void;
};

function valueToDigits(value: string): string {
    if (value === '') {
        return '';
    }

    const amount = Number(value.replace(',', '.'));

    return Number.isFinite(amount) ? amountToCurrencyDigits(amount) : '';
}

export function CurrencyInput({
    value,
    onValueChange,
    placeholder = 'R$ 0,00',
    ...props
}: CurrencyInputProps) {
    const [digits, setDigits] = useState(() => valueToDigits(value));
    const [lastSyncedValue, setLastSyncedValue] = useState(value);

    if (value !== lastSyncedValue) {
        setLastSyncedValue(value);
        setDigits(valueToDigits(value));
    }

    const displayValue =
        digits === '' ? '' : formatCurrencyMaskFromDigits(digits);

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => {
                const nextDigits = e.target.value.replace(/\D/g, '');
                const nextValue =
                    nextDigits === ''
                        ? ''
                        : currencyDigitsToAmount(nextDigits).toFixed(2);

                setDigits(nextDigits);
                setLastSyncedValue(nextValue);
                onValueChange(nextValue);
            }}
        />
    );
}
