import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/features/categories/types';
import {
    DAY_OF_WEEK_OPTIONS,
    RECURRENCE_OPTIONS,
} from '@/features/fixed-expenses/format';
import type {
    FixedExpenseFormValues,
    RecurrenceType,
} from '@/features/fixed-expenses/types';

type FixedExpenseFormFieldsProps = {
    idPrefix: string;
    categories: Category[];
    values: FixedExpenseFormValues;
    errors: Partial<Record<keyof FixedExpenseFormValues, string>>;
    onChange: <K extends keyof FixedExpenseFormValues>(
        field: K,
        value: FixedExpenseFormValues[K],
    ) => void;
};

export function FixedExpenseFormFields({
    idPrefix,
    categories,
    values,
    errors,
    onChange,
}: FixedExpenseFormFieldsProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
                <Input
                    id={`${idPrefix}-name`}
                    name="name"
                    placeholder="Ex: Aluguel, Psic\u00f3loga"
                    value={values.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-provider`}>
                    Prestador / recebedor (opcional)
                </Label>
                <Input
                    id={`${idPrefix}-provider`}
                    name="provider_name"
                    placeholder="Ex: Maria, Imobili\u00e1ria Central"
                    value={values.provider_name}
                    onChange={(e) => onChange('provider_name', e.target.value)}
                />
                <InputError message={errors.provider_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-category`}>Categoria</Label>
                <Select
                    value={values.category_id}
                    onValueChange={(v) => onChange('category_id', v)}
                >
                    <SelectTrigger
                        id={`${idPrefix}-category`}
                        className="w-full"
                    >
                        <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={String(category.id)}
                            >
                                <span
                                    className="mr-2 inline-block size-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.category_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-amount`}>
                    Valor padr&atilde;o (R$)
                </Label>
                <Input
                    id={`${idPrefix}-amount`}
                    name="default_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={values.default_amount}
                    onChange={(e) => onChange('default_amount', e.target.value)}
                    required
                />
                <InputError message={errors.default_amount} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-recurrence`}>Ciclo</Label>
                <Select
                    value={values.recurrence_type}
                    onValueChange={(v) =>
                        onChange('recurrence_type', v as RecurrenceType)
                    }
                >
                    <SelectTrigger
                        id={`${idPrefix}-recurrence`}
                        className="w-full"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {RECURRENCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.recurrence_type} />
            </div>

            {values.recurrence_type === 'monthly' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-day-of-month`}>
                        Dia do m&ecirc;s
                    </Label>
                    <Input
                        id={`${idPrefix}-day-of-month`}
                        name="day_of_month"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1 a 31"
                        value={values.day_of_month}
                        onChange={(e) =>
                            onChange('day_of_month', e.target.value)
                        }
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Quando o m&ecirc;s n&atilde;o tiver esse dia, o
                        vencimento usa o &uacute;ltimo dia dispon&iacute;vel.
                    </p>
                    <InputError message={errors.day_of_month} />
                </div>
            )}

            {values.recurrence_type === 'weekly' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-day-of-week`}>
                        Dia da semana
                    </Label>
                    <Select
                        value={values.day_of_week}
                        onValueChange={(v) => onChange('day_of_week', v)}
                    >
                        <SelectTrigger
                            id={`${idPrefix}-day-of-week`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAY_OF_WEEK_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.day_of_week} />
                </div>
            )}

            {values.recurrence_type === 'biweekly' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-anchor-date`}>
                        Primeira ocorr&ecirc;ncia
                    </Label>
                    <Input
                        id={`${idPrefix}-anchor-date`}
                        name="anchor_date"
                        type="date"
                        value={values.anchor_date}
                        onChange={(e) =>
                            onChange('anchor_date', e.target.value)
                        }
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        As pr&oacute;ximas ocorr&ecirc;ncias acontecem a cada 14
                        dias a partir desta data.
                    </p>
                    <InputError message={errors.anchor_date} />
                </div>
            )}
        </div>
    );
}
