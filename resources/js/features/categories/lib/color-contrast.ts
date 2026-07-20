export function isLightColor(hex: string): boolean {
    const normalized = hex.replace('#', '');

    if (normalized.length !== 6) {
        return false;
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);

    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
