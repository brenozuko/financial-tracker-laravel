import { CategoryListItem } from '@/features/categories/components/category-list-item';
import type { Category } from '@/features/categories/types';

type CategoryListProps = {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
};

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                {categories.map((category) => (
                    <CategoryListItem
                        key={category.id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </ul>
        </div>
    );
}
