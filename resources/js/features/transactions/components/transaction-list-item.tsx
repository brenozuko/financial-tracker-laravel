import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import type { Transaction } from '@/features/transactions/types';

type TransactionListItemProps = {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
};

function formatAmount(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
}

export function TransactionListItem({
    transaction,
    onEdit,
    onDelete,
}: TransactionListItemProps) {
    const isIncome = transaction.type === 'income';

    return (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <span
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: transaction.category.color }}
                aria-hidden
            />
            <CategoryIcon
                name={transaction.category.icon}
                className="size-5 shrink-0 text-muted-foreground"
            />
            <div className="min-w-0 flex-1">
                <p className="font-medium">
                    {transaction.description ?? transaction.category.name}
                </p>
                <p className="text-sm text-muted-foreground">
                    {transaction.category.name} · {formatDate(transaction.occurred_at)}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <Badge
                    variant={isIncome ? 'default' : 'destructive'}
                    className={
                        isIncome
                            ? 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300'
                            : ''
                    }
                >
                    {isIncome ? 'Receita' : 'Despesa'}
                </Badge>
                <span
                    className={
                        isIncome
                            ? 'font-semibold text-green-700 dark:text-green-400'
                            : 'font-semibold text-red-600 dark:text-red-400'
                    }
                >
                    {isIncome ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                </span>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                    >
                        <Pencil className="mr-1 size-4" />
                        Editar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(transaction)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="mr-1 size-4" />
                        Excluir
                    </Button>
                </div>
            </div>
        </div>
    );
}
