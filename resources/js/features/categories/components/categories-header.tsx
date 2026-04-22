import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoriesHeaderProps = {
    onNewCategory: () => void;
};

export function CategoriesHeader({ onNewCategory }: CategoriesHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Categorias</h1>
            <Button type="button" onClick={onNewCategory}>
                <Plus className="mr-2 size-4" />
                Nova categoria
            </Button>
        </div>
    );
}
