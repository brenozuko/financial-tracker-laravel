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

type TransactionEditDialogProps = {
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

export function TransactionEditDialog({
    categories,
    open,
    onOpenChange,
    onSubmit,
    onCancel,
    values,
    errors,
    onFieldChange,
    processing,
}: TransactionEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar transação</DialogTitle>
                        <DialogDescription>
                            Atualize os dados desta transação.
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionFormFields
                        idPrefix="edit"
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
                            Atualizar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
