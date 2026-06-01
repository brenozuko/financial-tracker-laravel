import { Link } from '@inertiajs/react';
import { ArrowRight, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import type { Transaction } from '@/features/transactions/types';
import { transactions } from '@/routes';

type RecentTransactionsProps = {
    recentTransactions?: Transaction[];
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
    }).format(new Date(dateString));
}

export function RecentTransactions({
    recentTransactions = [],
}: RecentTransactionsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Transações recentes</CardTitle>
                <Link
                    href={transactions()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    prefetch
                >
                    Ver todas
                    <ArrowRight className="size-4" />
                </Link>
            </CardHeader>
            <CardContent>
                {recentTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <Receipt className="size-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Nenhuma transação este mês.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {recentTransactions.map((transaction) => {
                            const isIncome = transaction.type === 'income';
                            return (
                                <li
                                    key={transaction.id}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <span
                                        className="size-3.5 shrink-0 rounded-full border border-border"
                                        style={{ backgroundColor: transaction.category.color }}
                                        aria-hidden
                                    />
                                    <CategoryIcon
                                        name={transaction.category.icon}
                                        className="size-4 shrink-0 text-muted-foreground"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {transaction.description ?? transaction.category.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {transaction.category.name}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span
                                            className={
                                                isIncome
                                                    ? 'text-sm font-semibold text-green-700 dark:text-green-400'
                                                    : 'text-sm font-semibold text-red-600 dark:text-red-400'
                                            }
                                        >
                                            {isIncome ? '+' : '-'}
                                            {formatAmount(transaction.amount)}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {formatDate(transaction.occurred_at)}
                                        </Badge>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
