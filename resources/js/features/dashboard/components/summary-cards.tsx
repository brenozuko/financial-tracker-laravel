import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SummaryCardsProps = {
    income?: number;
    expenses?: number;
    balance?: number;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function SummaryCards({
    income = 0,
    expenses = 0,
    balance = 0,
}: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Receitas do mês
                    </CardTitle>
                    <ArrowUpCircle className="size-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(income)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Despesas do mês
                    </CardTitle>
                    <ArrowDownCircle className="size-5 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(expenses)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Saldo do mês
                    </CardTitle>
                    <Wallet className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p
                        className={
                            balance >= 0
                                ? 'text-2xl font-bold text-green-700 dark:text-green-400'
                                : 'text-2xl font-bold text-red-600 dark:text-red-400'
                        }
                    >
                        {formatCurrency(balance)}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
