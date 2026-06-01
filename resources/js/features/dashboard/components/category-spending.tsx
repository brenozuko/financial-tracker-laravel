import { Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import type { Category } from '@/features/transactions/types';

type CategorySpendingItem = {
    category: Category;
    total: number;
    percentage: number;
};

type CategorySpendingProps = {
    categorySpending?: CategorySpendingItem[];
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function CategorySpending({ categorySpending = [] }: CategorySpendingProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Gastos por categoria</CardTitle>
            </CardHeader>
            <CardContent>
                {categorySpending.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <Tags className="size-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Nenhuma despesa registrada este mês.
                        </p>
                    </div>
                ) : (
                    <ul className="grid gap-4">
                        {categorySpending.map(({ category, total, percentage }) => (
                            <li key={category.id} className="grid gap-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="size-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                            aria-hidden
                                        />
                                        <CategoryIcon
                                            name={category.icon}
                                            className="size-4 shrink-0 text-muted-foreground"
                                        />
                                        <span className="truncate text-sm font-medium">
                                            {category.name}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {percentage.toFixed(0)}%
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            backgroundColor: category.color,
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
