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
import { CategoryFormFields } from '@/features/categories/components/category-form-fields';
import type { CategoryFormValues } from '@/features/categories/types';

type CategoryEditDialogProps = {
    categoryIcons: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    values: CategoryFormValues;
    errors: Partial<Record<keyof CategoryFormValues, string>>;
    onFieldChange: <K extends keyof CategoryFormValues>(
        field: K,
        value: CategoryFormValues[K],
    ) => void;
    processing: boolean;
};

export function CategoryEditDialog({
    categoryIcons,
    open,
    onOpenChange,
    onSubmit,
    onCancel,
    values,
    errors,
    onFieldChange,
    processing,
}: CategoryEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar categoria</DialogTitle>
                        <DialogDescription>
                            Atualize os dados da categoria.
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryFormFields
                        idPrefix="edit"
                        categoryIcons={categoryIcons}
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
