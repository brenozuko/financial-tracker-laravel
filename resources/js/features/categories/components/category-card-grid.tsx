import type { DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { reorder, store } from '@/actions/App/Http/Controllers/CategoryController';
import { CategoryAddCard } from '@/features/categories/components/category-add-card';
import { CategoryCard } from '@/features/categories/components/category-card';
import { displayCategoryName } from '@/features/categories/display-category-name';
import { nextQuickCategoryName } from '@/features/categories/lib/next-quick-category-name';
import {
    QUICK_CATEGORY_COLOR,
    QUICK_CATEGORY_ICON,
} from '@/features/categories/lib/quick-category-defaults';
import type { Category } from '@/features/categories/types';

type CategoryCardGridProps = {
    categories: Category[];
    categoryIcons: string[];
    search: string;
    onDelete: (category: Category) => void;
};

function SortableCategoryCard({
    category,
    categoryIcons,
    onDelete,
    sortingEnabled,
}: {
    category: Category;
    categoryIcons: string[];
    onDelete: (category: Category) => void;
    sortingEnabled: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: category.id,
        disabled: !sortingEnabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <CategoryCard
                category={category}
                categoryIcons={categoryIcons}
                onDelete={onDelete}
                dragHandle={
                    sortingEnabled
                        ? { attributes, listeners }
                        : undefined
                }
            />
        </div>
    );
}

export function CategoryCardGrid({
    categories,
    categoryIcons,
    search,
    onDelete,
}: CategoryCardGridProps) {
    const [items, setItems] = useState(categories);
    const [previousCategories, setPreviousCategories] = useState(categories);
    const [creating, setCreating] = useState(false);

    if (categories !== previousCategories) {
        setPreviousCategories(categories);
        setItems(categories);
    }

    const normalizedSearch = search.trim().toLowerCase();
    const sortingEnabled = normalizedSearch === '';

    const visibleItems = sortingEnabled
        ? items
        : items.filter((category) =>
              displayCategoryName(category)
                  .toLowerCase()
                  .includes(normalizedSearch),
          );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (!sortingEnabled) {
            return;
        }

        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);

        router.patch(
            reorder.url(),
            { ordered_ids: reordered.map((c) => c.id) },
            {
                preserveScroll: true,
                onError: () => setItems(categories),
            },
        );
    };

    const handleAdd = () => {
        if (creating) {
            return;
        }

        setCreating(true);

        router.post(
            store.url(),
            {
                name: nextQuickCategoryName(categories),
                color: QUICK_CATEGORY_COLOR,
                icon: QUICK_CATEGORY_ICON,
            },
            {
                preserveScroll: true,
                onFinish: () => setCreating(false),
            },
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={visibleItems.map((c) => c.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {visibleItems.map((category) => (
                        <SortableCategoryCard
                            key={category.id}
                            category={category}
                            categoryIcons={categoryIcons}
                            onDelete={onDelete}
                            sortingEnabled={sortingEnabled}
                        />
                    ))}

                    {visibleItems.length === 0 && normalizedSearch !== '' && (
                        <p className="col-span-full text-sm text-muted-foreground">
                            Nenhuma categoria encontrada.
                        </p>
                    )}

                    <CategoryAddCard onAdd={handleAdd} processing={creating} />
                </div>
            </SortableContext>
        </DndContext>
    );
}
