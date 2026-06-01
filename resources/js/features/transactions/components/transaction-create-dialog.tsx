import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { TransactionFormFields } from '@/features/transactions/components/transaction-form-fields';
import type { Category, TransactionFormValues } from '@/features/transactions/types';

type TransactionCreateDialogProps = {
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    values: TransactionFormValues;
    errors: Partial<Record<keyof TransactionFormValues, string>>;
    onFieldChange: <K extends keyof TransactionFormValues>(
        field: K,
        value: TransactionFormValues[K],
    ) => void;
    processing: boolean;
};

export function TransactionCreateDialog({
    categories,
    open,
    onOpenChange,
    onSubmit,
    onCancel,
    values,
    errors,
    onFieldChange,
    processing,
}: TransactionCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nova transação</DialogTitle>
                        <DialogDescription>
                            Registre uma receita ou despesa.
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionFormFields
                        idPrefix="create"
                        categories={categories}
                        values={values}
                        errors={errors}
                        onChange={onFieldChange}
                    />
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
