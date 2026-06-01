import { Receipt } from 'lucide-react';
import { TransactionListItem } from '@/features/transactions/components/transaction-list-item';
import type { Transaction } from '@/features/transactions/types';

type TransactionListProps = {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
};

export function TransactionList({
    transactions,
    onEdit,
    onDelete,
}: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-sidebar-border/70 py-16 text-center dark:border-sidebar-border">
                <Receipt className="size-10 text-muted-foreground/50" />
                <div>
                    <p className="font-medium text-muted-foreground">
                        Nenhuma transação encontrada
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                        Adicione sua primeira transação clicando em "Nova transação".
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                        <TransactionListItem
                            transaction={transaction}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
