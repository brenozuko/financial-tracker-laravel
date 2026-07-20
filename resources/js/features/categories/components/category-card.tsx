import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { router } from '@inertiajs/react';
import { GripVertical, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/CategoryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CategoryIcon } from '@/features/categories/category-icon-map';
import { CategoryColorPicker } from '@/features/categories/components/category-color-picker';
import { CategoryIconPicker } from '@/features/categories/components/category-icon-picker';
import { displayCategoryName } from '@/features/categories/display-category-name';
import { isLightColor } from '@/features/categories/lib/color-contrast';
import type { Category } from '@/features/categories/types';
import { cn } from '@/lib/utils';

type DragHandleProps = {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
};

type CategoryCardProps = {
    category: Category;
    categoryIcons: string[];
    onDelete: (category: Category) => void;
    dragHandle?: DragHandleProps;
};

export function CategoryCard({
    category,
    categoryIcons,
    onDelete,
    dragHandle,
}: CategoryCardProps) {
    const [editingName, setEditingName] = useState(false);
    const [draftName, setDraftName] = useState(category.name);
    const [nameError, setNameError] = useState<string | undefined>();
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [draftColor, setDraftColor] = useState(category.color);
    const [saving, setSaving] = useState(false);

    const startEditingName = () => {
        setDraftName(category.name);
        setNameError(undefined);
        setEditingName(true);
    };

    const save = (payload: {
        name: string;
        color: string;
        icon: string | null;
    }) => {
        setSaving(true);
        setNameError(undefined);

        router.put(
            update.url(category),
            {
                name: payload.name,
                color: payload.color,
                icon: payload.icon,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.name) {
                        setNameError(errors.name);
                        setEditingName(true);
                        setDraftName(payload.name);
                    }
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    const commitName = () => {
        const trimmed = draftName.trim();

        if (!trimmed) {
            setNameError('O nome é obrigatório.');
            setDraftName(category.name);
            setEditingName(false);

            return;
        }

        setEditingName(false);

        if (trimmed === category.name) {
            return;
        }

        save({
            name: trimmed,
            color: category.color,
            icon: category.icon,
        });
    };

    const handleAppearanceOpenChange = (open: boolean) => {
        if (open) {
            setDraftColor(category.color);
            setAppearanceOpen(true);

            return;
        }

        setAppearanceOpen(false);

        if (draftColor.toLowerCase() !== category.color.toLowerCase()) {
            save({
                name: category.name,
                color: draftColor,
                icon: category.icon,
            });
        }
    };

    const handleIconChange = (icon: string) => {
        const nextIcon = icon || null;

        if (nextIcon === category.icon) {
            return;
        }

        save({
            name: category.name,
            color: draftColor,
            icon: nextIcon,
        });
    };

    const iconOnLight = isLightColor(category.color);

    return (
        <Card
            className={cn(
                'group relative gap-0 py-4 shadow-sm transition-opacity',
                saving && 'opacity-70',
            )}
        >
            {dragHandle && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 size-8 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-foreground active:cursor-grabbing"
                    aria-label={`Arrastar ${displayCategoryName(category)}`}
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                >
                    <GripVertical className="size-4" />
                </Button>
            )}

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-8 text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-destructive"
                aria-label={`Excluir ${displayCategoryName(category)}`}
                disabled={saving}
                onClick={() => onDelete(category)}
            >
                <Trash2 className="size-4" />
            </Button>

            <CardContent className="flex flex-col items-center gap-3 px-4 pt-2">
                <Popover
                    open={appearanceOpen}
                    onOpenChange={handleAppearanceOpenChange}
                >
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex size-16 shrink-0 items-center justify-center rounded-full border border-black/10 shadow-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            style={{ backgroundColor: category.color }}
                            aria-label={`Alterar cor e ícone de ${displayCategoryName(category)}`}
                            disabled={saving}
                        >
                            {category.icon ? (
                                <CategoryIcon
                                    name={category.icon}
                                    className={cn(
                                        'size-7',
                                        iconOnLight
                                            ? 'text-neutral-900'
                                            : 'text-white',
                                    )}
                                />
                            ) : (
                                <Tag
                                    className={cn(
                                        'size-7',
                                        iconOnLight
                                            ? 'text-neutral-900/70'
                                            : 'text-white/80',
                                    )}
                                />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-4 p-3" align="center">
                        <CategoryColorPicker
                            id={`category-${category.id}-color`}
                            value={draftColor}
                            onChange={setDraftColor}
                            showLabel
                        />
                        <CategoryIconPicker
                            categoryIcons={categoryIcons}
                            value={category.icon ?? ''}
                            onChange={handleIconChange}
                        />
                    </PopoverContent>
                </Popover>

                <div className="flex w-full flex-col items-center gap-1">
                    {editingName ? (
                        <Input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            onBlur={commitName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitName();
                                }

                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setDraftName(category.name);
                                    setNameError(undefined);
                                    setEditingName(false);
                                }
                            }}
                            disabled={saving}
                            autoFocus
                            className="h-8 text-center text-sm font-medium"
                            aria-label="Nome da categoria"
                        />
                    ) : (
                        <button
                            type="button"
                            className="w-full truncate rounded-md px-2 py-1 text-center text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={startEditingName}
                            disabled={saving}
                        >
                            {displayCategoryName(category)}
                        </button>
                    )}
                    <InputError message={nameError} />
                </div>
            </CardContent>
        </Card>
    );
}
