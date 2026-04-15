import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CategoryFormValues } from '@/features/categories/types';

type CategoryFormFieldsProps = {
    idPrefix: string;
    values: CategoryFormValues;
    errors: Partial<Record<keyof CategoryFormValues, string>>;
    onChange: <K extends keyof CategoryFormValues>(
        field: K,
        value: CategoryFormValues[K],
    ) => void;
};

export function CategoryFormFields({
    idPrefix,
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
                <Label htmlFor={`${idPrefix}-icon`}>Ícone (opcional)</Label>
                <Input
                    id={`${idPrefix}-icon`}
                    name="icon"
                    value={values.icon}
                    onChange={(e) => onChange('icon', e.target.value)}
                    placeholder="ex.: utensils"
                />
                <InputError message={errors.icon} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-sort`}>Ordem (opcional)</Label>
                <Input
                    id={`${idPrefix}-sort`}
                    name="sort_order"
                    type="number"
                    min={0}
                    value={values.sort_order}
                    onChange={(e) =>
                        onChange(
                            'sort_order',
                            e.target.value === '' ? '' : Number(e.target.value),
                        )
                    }
                />
                <InputError message={errors.sort_order} />
            </div>
        </div>
    );
}
