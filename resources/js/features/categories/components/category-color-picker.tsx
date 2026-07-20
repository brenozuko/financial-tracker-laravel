import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const FALLBACK_COLOR = '#6b7280';

type CategoryColorPickerProps = {
    id?: string;
    value: string;
    onChange: (color: string) => void;
    error?: string;
    showLabel?: boolean;
    className?: string;
};

export function CategoryColorPicker({
    id = 'category-color',
    value,
    onChange,
    error,
    showLabel = true,
    className,
}: CategoryColorPickerProps) {
    const [hexInput, setHexInput] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);

    if (value !== previousValue) {
        setPreviousValue(value);
        setHexInput(value);
    }

    const pickerColor = HEX_COLOR_PATTERN.test(value) ? value : FALLBACK_COLOR;

    const handlePickerChange = (color: string) => {
        onChange(color);
        setHexInput(color);
    };

    const handleHexInputChange = (raw: string) => {
        setHexInput(raw);

        const next = raw.startsWith('#') ? raw : `#${raw}`;

        if (HEX_COLOR_PATTERN.test(next)) {
            onChange(next.toLowerCase());
        }
    };

    return (
        <div className={cn('grid gap-3', className)}>
            {showLabel && <Label htmlFor={id}>Cor</Label>}
            <HexColorPicker
                color={pickerColor}
                onChange={handlePickerChange}
                className="!h-36 !w-full"
            />
            <div className="flex items-center gap-2">
                <span
                    className="size-8 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: pickerColor }}
                    aria-hidden
                />
                <Input
                    id={id}
                    name="color"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    maxLength={7}
                    spellCheck={false}
                    className="font-mono uppercase"
                    aria-label="Código hexadecimal da cor"
                />
            </div>
            <InputError message={error} />
        </div>
    );
}
