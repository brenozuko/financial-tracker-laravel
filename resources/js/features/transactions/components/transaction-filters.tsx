import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Category, TransactionFiltersState } from '@/features/transactions/types';

type TransactionFiltersProps = {
    categories: Category[];
    filters: TransactionFiltersState;
    onFiltersChange: (filters: TransactionFiltersState) => void;
};

export function TransactionFilters({
    categories,
    filters,
    onFiltersChange,
}: TransactionFiltersProps) {
    const set = <K extends keyof TransactionFiltersState>(
        key: K,
        value: TransactionFiltersState[K],
    ) => onFiltersChange({ ...filters, [key]: value });

    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select
                    value={filters.type}
                    onValueChange={(v) =>
                        set('type', v as TransactionFiltersState['type'])
                    }
                >
                    <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="income">Receitas</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select
                    value={filters.category_id}
                    onValueChange={(v) => set('category_id', v)}
                >
                    <SelectTrigger className="h-8 w-44">
                        <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
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
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="filter-month" className="text-xs text-muted-foreground">
                    Mês
                </Label>
                <Input
                    id="filter-month"
                    type="month"
                    className="h-8 w-40"
                    value={filters.month}
                    onChange={(e) => set('month', e.target.value)}
                />
            </div>
        </div>
    );
}
