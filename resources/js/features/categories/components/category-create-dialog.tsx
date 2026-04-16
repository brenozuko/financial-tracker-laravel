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

type CategoryCreateDialogProps = {
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

export function CategoryCreateDialog({
    categoryIcons,
    open,
    onOpenChange,
    onSubmit,
    onCancel,
    values,
    errors,
    onFieldChange,
    processing,
}: CategoryCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nova categoria</DialogTitle>
                        <DialogDescription>
                            Defina nome, cor e opcionalmente um ícone.
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryFormFields
                        idPrefix="create"
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
