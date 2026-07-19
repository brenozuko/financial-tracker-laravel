export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/** Converts a numeric amount to cent digits for currency masking. */
export function amountToCurrencyDigits(amount: number): string {
    return String(Math.round(Math.max(0, amount) * 100));
}

/** Parses cent digits from a masked currency input back to a number. */
export function currencyDigitsToAmount(digits: string): number {
    const cents = Number(digits.replace(/\D/g, ''));

    if (!Number.isFinite(cents)) {
        return 0;
    }

    return cents / 100;
}

/** Formats raw cent digits as a BRL currency string (e.g. "123456" → "R$ 1.234,56"). */
export function formatCurrencyMaskFromDigits(digits: string): string {
    return formatCurrency(currencyDigitsToAmount(digits));
}
