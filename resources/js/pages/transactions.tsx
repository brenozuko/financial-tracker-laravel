import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { TransactionCreateDialog } from '@/features/transactions/components/transaction-create-dialog';
import { TransactionEditDialog } from '@/features/transactions/components/transaction-edit-dialog';
import { TransactionFilters } from '@/features/transactions/components/transaction-filters';
import { TransactionFlashMessages } from '@/features/transactions/components/transaction-flash-messages';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { TransactionsHeader } from '@/features/transactions/components/transactions-header';
import type {
    Category,
    Transaction,
    TransactionFiltersState,
} from '@/features/transactions/types';
import { useAppPage } from '@/hooks/use-app-page';
import { transactions } from '@/routes';

type TransactionsPageProps = {
    transactions?: Transaction[];
    categories?: Category[];
};

const defaultFilters: TransactionFiltersState = {
    type: 'all',
    category_id: 'all',
    month: new Date().toISOString().slice(0, 7),
};

export default function Transactions({
    transactions: allTransactions = [],
    categories = [],
}: TransactionsPageProps) {
    const { flash } = useAppPage().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters);

    const createForm = useForm({
        category_id: '',
        type: 'expense' as 'income' | 'expense',
        amount: '',
        occurred_at: new Date().toISOString().slice(0, 10),
        description: '',
    });

    const editForm = useForm({
        category_id: '',
        type: 'expense' as 'income' | 'expense',
        amount: '',
        occurred_at: '',
        description: '',
    });

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateOpen(true);
    };

    const openEdit = (transaction: Transaction) => {
        editForm.setData({
            category_id: String(transaction.category_id),
            type: transaction.type,
            amount: String(transaction.amount),
            occurred_at: transaction.occurred_at.slice(0, 10),
            description: transaction.description ?? '',
        });
        editForm.clearErrors();
        setEditing(transaction);
    };

    // TODO: wire up to TransactionController once created
    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        // createForm.post('/transactions', {
        //     preserveScroll: true,
        //     onSuccess: () => {
        //         setCreateOpen(false);
        //         createForm.reset();
        //     },
        // });
    };

    // TODO: wire up to TransactionController once created
    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        // if (!editing) return;
        // editForm.put(`/transactions/${editing.id}`, {
        //     preserveScroll: true,
        //     onSuccess: () => setEditing(null),
        // });
    };

    // TODO: wire up to TransactionController once created
    const handleDelete = (transaction: Transaction) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        // router.delete(`/transactions/${transaction.id}`, { preserveScroll: true });
    };

    const filteredTransactions = allTransactions.filter((t) => {
        if (filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category_id !== 'all' && String(t.category_id) !== filters.category_id)
            return false;
        if (filters.month && !t.occurred_at.startsWith(filters.month)) return false;
        return true;
    });

    return (
        <>
            <Head title="Transações" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <TransactionFlashMessages flash={flash} />
                <TransactionsHeader onNewTransaction={openCreate} />
                <TransactionFilters
                    categories={categories}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
                <TransactionList
                    transactions={filteredTransactions}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />
            </div>

            <TransactionCreateDialog
                categories={categories}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={submitCreate}
                onCancel={() => setCreateOpen(false)}
                values={createForm.data}
                errors={
                    createForm.errors as Partial<
                        Record<keyof typeof createForm.data, string>
                    >
                }
                onFieldChange={(field, value) =>
                    createForm.setData(field, value as never)
                }
                processing={createForm.processing}
            />

            <TransactionEditDialog
                categories={categories}
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                onSubmit={submitEdit}
                onCancel={() => setEditing(null)}
                values={editForm.data}
                errors={
                    editForm.errors as Partial<
                        Record<keyof typeof editForm.data, string>
                    >
                }
                onFieldChange={(field, value) =>
                    editForm.setData(field, value as never)
                }
                processing={editForm.processing}
            />
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [
        {
            title: 'Transações',
            href: transactions(),
        },
    ],
};
