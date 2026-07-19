import { CurrencyInput } from '@/components/currency-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Category, TransactionFormValues } from '@/features/transactions/types';
import { cn } from '@/lib/utils';

type TransactionFormFieldsProps = {
    idPrefix: string;
    categories: Category[];
    values: TransactionFormValues;
    errors: Partial<Record<keyof TransactionFormValues, string>>;
    onChange: <K extends keyof TransactionFormValues>(
        field: K,
        value: TransactionFormValues[K],
    ) => void;
};

export function TransactionFormFields({
    idPrefix,
    categories,
    values,
    errors,
    onChange,
}: TransactionFormFieldsProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={values.type === 'income' ? 'default' : 'outline'}
                        className={cn(
                            'flex-1',
                            values.type === 'income' &&
                                'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
                        )}
                        onClick={() => onChange('type', 'income')}
                    >
                        Receita
                    </Button>
                    <Button
                        type="button"
                        variant={values.type === 'expense' ? 'default' : 'outline'}
                        className={cn(
                            'flex-1',
                            values.type === 'expense' &&
                                'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
                        )}
                        onClick={() => onChange('type', 'expense')}
                    >
                        Despesa
                    </Button>
                </div>
                <InputError message={errors.type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-amount`}>Valor (R$)</Label>
                <CurrencyInput
                    id={`${idPrefix}-amount`}
                    name="amount"
                    value={values.amount}
                    onValueChange={(value) => onChange('amount', value)}
                    required
                />
                <InputError message={errors.amount} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-category`}>Categoria</Label>
                <Select
                    value={values.category_id}
                    onValueChange={(v) => onChange('category_id', v)}
                >
                    <SelectTrigger id={`${idPrefix}-category`} className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
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
                <Label htmlFor={`${idPrefix}-occurred_at`}>Data</Label>
                <Input
                    id={`${idPrefix}-occurred_at`}
                    name="occurred_at"
                    type="date"
                    value={values.occurred_at}
                    onChange={(e) => onChange('occurred_at', e.target.value)}
                    required
                />
                <InputError message={errors.occurred_at} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-description`}>Descrição (opcional)</Label>
                <Input
                    id={`${idPrefix}-description`}
                    name="description"
                    type="text"
                    placeholder="Ex: Mercado da semana"
                    value={values.description}
                    onChange={(e) => onChange('description', e.target.value)}
                />
                <InputError message={errors.description} />
            </div>
        </div>
    );
}
