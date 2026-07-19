import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FixedExpensesHeaderProps = {
    onNewFixedExpense: () => void;
};

export function FixedExpensesHeader({
    onNewFixedExpense,
}: FixedExpensesHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">
                    Contas fixas
                </h1>
                <p className="text-sm text-muted-foreground">
                    Previsão mensal e pagamentos das suas despesas recorrentes.
                </p>
            </div>
            <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={onNewFixedExpense}
            >
                <Plus className="mr-2 size-4" />
                Nova conta fixa
            </Button>
        </div>
    );
}
