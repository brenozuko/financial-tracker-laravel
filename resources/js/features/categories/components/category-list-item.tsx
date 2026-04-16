import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import { displayCategoryName } from '@/features/categories/display-category-name';
import type { Category } from '@/features/categories/types';

type CategoryListItemProps = {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
};

export function CategoryListItem({
    category,
    onEdit,
    onDelete,
}: CategoryListItemProps) {
    return (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <span
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: category.color }}
                aria-hidden
            />
            <CategoryIcon
                name={category.icon}
                className="size-5 shrink-0 text-muted-foreground"
            />
            <div className="min-w-0 flex-1">
                <p className="font-medium">{displayCategoryName(category)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(category)}
                >
                    <Pencil className="mr-1 size-4" />
                    Editar
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(category)}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="mr-1 size-4" />
                    Excluir
                </Button>
            </div>
        </div>
    );
}
