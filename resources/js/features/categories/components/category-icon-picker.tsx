import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import { cn } from '@/lib/utils';

type CategoryIconPickerProps = {
    categoryIcons: string[];
    value: string;
    onChange: (icon: string) => void;
    error?: string;
    showLabel?: boolean;
    className?: string;
};

export function CategoryIconPicker({
    categoryIcons,
    value,
    onChange,
    error,
    showLabel = true,
    className,
}: CategoryIconPickerProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            {showLabel && (
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ícone (opcional)
                </span>
            )}
            <div className="max-h-56 overflow-y-auto rounded-md border border-input p-3">
                <div className="grid grid-cols-4 gap-3">
                    <Button
                        type="button"
                        variant={value === '' ? 'secondary' : 'outline'}
                        size="icon"
                        className="size-11 shrink-0 text-xs"
                        title="Nenhum"
                        onClick={() => onChange('')}
                    >
                        —
                    </Button>
                    {categoryIcons.map((iconName) => (
                        <Button
                            key={iconName}
                            type="button"
                            variant={value === iconName ? 'secondary' : 'outline'}
                            size="icon"
                            className={cn(
                                'size-11 shrink-0',
                                value === iconName && 'ring-2 ring-ring',
                            )}
                            title={iconName}
                            onClick={() => onChange(iconName)}
                        >
                            <CategoryIcon name={iconName} className="size-5" />
                        </Button>
                    ))}
                </div>
            </div>
            <InputError message={error} />
        </div>
    );
}
