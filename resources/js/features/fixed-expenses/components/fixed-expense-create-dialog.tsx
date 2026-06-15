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
import type { Category } from '@/features/categories/types';
import { FixedExpenseFormFields } from '@/features/fixed-expenses/components/fixed-expense-form-fields';
import type { FixedExpenseFormValues } from '@/features/fixed-expenses/types';

type FixedExpenseCreateDialogProps = {
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    values: FixedExpenseFormValues;
    errors: Partial<Record<keyof FixedExpenseFormValues, string>>;
    onFieldChange: <K extends keyof FixedExpenseFormValues>(
        field: K,
        value: FixedExpenseFormValues[K],
    ) => void;
    processing: boolean;
};

export function FixedExpenseCreateDialog({
    categories,
    open,
    onOpenChange,
    onSubmit,
    onCancel,
    values,
    errors,
    onFieldChange,
    processing,
}: FixedExpenseCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nova conta fixa</DialogTitle>
                        <DialogDescription>
                            Cadastre uma despesa recorrente. As
                            ocorr&ecirc;ncias do m&ecirc;s ser&atilde;o geradas
                            automaticamente.
                        </DialogDescription>
                    </DialogHeader>
                    <FixedExpenseFormFields
                        idPrefix="create-fixed-expense"
                        categories={categories}
                        values={values}
                        errors={errors}
                        onChange={onFieldChange}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
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
