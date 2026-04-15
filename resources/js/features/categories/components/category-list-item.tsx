import { Button } from '@/components/ui/button';
import { displayCategoryName } from '@/features/categories/display-category-name';
import type { Category } from '@/features/categories/types';
import { Pencil, Trash2 } from 'lucide-react';

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
        <li className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: category.color }}
                aria-hidden
            />
            <div className="min-w-0 flex-1">
                <p className="font-medium">{displayCategoryName(category)}</p>
                {category.icon ? (
                    <p className="text-xs text-muted-foreground">
                        {category.icon}
                    </p>
                ) : null}
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
        </li>
    );
}
