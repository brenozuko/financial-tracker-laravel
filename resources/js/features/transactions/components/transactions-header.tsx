import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TransactionsHeaderProps = {
    onNewTransaction: () => void;
};

export function TransactionsHeader({ onNewTransaction }: TransactionsHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Transações</h1>
            <Button type="button" onClick={onNewTransaction}>
                <Plus className="mr-2 size-4" />
                Nova transação
            </Button>
        </div>
    );
}
