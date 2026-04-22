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
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import { GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reorder } from '@/actions/App/Http/Controllers/CategoryController';
import { Button } from '@/components/ui/button';
import { CategoryListItem } from '@/features/categories/components/category-list-item';
import type { Category } from '@/features/categories/types';

type SortableCategoryListProps = {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
};

function SortableCategoryRow({
    category,
    onEdit,
    onDelete,
}: {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="flex flex-wrap items-center gap-2 px-4 py-3"
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
                aria-label="Arrastar para reordenar"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </Button>
            <CategoryListItem
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </li>
    );
}

export function SortableCategoryList({
    categories,
    onEdit,
    onDelete,
}: SortableCategoryListProps) {
    const [items, setItems] = useState(categories);

    useEffect(() => {
        setItems(categories);
    }, [categories]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
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

        const orderedIds = reordered.map((c) => c.id);

        router.patch(
            reorder.url(),
            { ordered_ids: orderedIds },
            {
                preserveScroll: true,
                onError: () => {
                    setItems(categories);
                },
            },
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                        {items.map((category) => (
                            <SortableCategoryRow
                                key={category.id}
                                category={category}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
}
