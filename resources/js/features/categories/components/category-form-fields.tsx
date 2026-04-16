import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import type { CategoryFormValues } from '@/features/categories/types';
import { cn } from '@/lib/utils';

type CategoryFormFieldsProps = {
    idPrefix: string;
    categoryIcons: string[];
    values: CategoryFormValues;
    errors: Partial<Record<keyof CategoryFormValues, string>>;
    onChange: <K extends keyof CategoryFormValues>(
        field: K,
        value: CategoryFormValues[K],
    ) => void;
};

export function CategoryFormFields({
    idPrefix,
    categoryIcons,
    values,
    errors,
    onChange,
}: CategoryFormFieldsProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
                <Input
                    id={`${idPrefix}-name`}
                    name="name"
                    value={values.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-color`}>Cor</Label>
                <Input
                    id={`${idPrefix}-color`}
                    name="color"
                    type="color"
                    className="h-10 w-full cursor-pointer"
                    value={values.color}
                    onChange={(e) => onChange('color', e.target.value)}
                    required
                />
                <InputError message={errors.color} />
            </div>
            <div className="grid gap-2">
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ícone (opcional)
                </span>
                <div className="max-h-48 overflow-y-auto rounded-md border border-input p-2">
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                        <Button
                            type="button"
                            variant={values.icon === '' ? 'secondary' : 'outline'}
                            size="icon"
                            className="size-10 shrink-0 text-xs"
                            title="Nenhum"
                            onClick={() => onChange('icon', '')}
                        >
                            —
                        </Button>
                        {categoryIcons.map((iconName) => (
                            <Button
                                key={iconName}
                                type="button"
                                variant={values.icon === iconName ? 'secondary' : 'outline'}
                                size="icon"
                                className={cn('size-10 shrink-0', values.icon === iconName && 'ring-2 ring-ring')}
                                title={iconName}
                                onClick={() => onChange('icon', iconName)}
                            >
                                <CategoryIcon name={iconName} className="size-5" />
                            </Button>
                        ))}
                    </div>
                </div>
                <InputError message={errors.icon} />
            </div>
        </div>
    );
}
