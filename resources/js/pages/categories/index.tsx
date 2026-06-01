import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/CategoryController';
import { CategoriesHeader } from '@/features/categories/components/categories-header';
import { CategoryCreateDialog } from '@/features/categories/components/category-create-dialog';
import { CategoryEditDialog } from '@/features/categories/components/category-edit-dialog';
import { CategoryFlashMessages } from '@/features/categories/components/category-flash-messages';
import { SortableCategoryList } from '@/features/categories/components/sortable-category-list';
import type { Category } from '@/features/categories/types';
import { useAppPage } from '@/hooks/use-app-page';

type CategoriesIndexPageProps = {
    categories: Category[];
    categoryIcons: string[];
};

export default function CategoriesIndex({
    categories,
    categoryIcons,
}: CategoriesIndexPageProps) {
    const { flash } = useAppPage().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);

    const createForm = useForm({
        name: '',
        color: '#6b7280',
        icon: '',
    });

    const editForm = useForm({
        name: '',
        color: '#6b7280',
        icon: '',
    });

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateOpen(true);
    };

    const openEdit = (category: Category) => {
        editForm.setData({
            name: category.name,
            color: category.color,
            icon: category.icon ?? '',
        });
        editForm.clearErrors();
        setEditing(category);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.transform((data) => ({
            name: data.name,
            color: data.color,
            icon: data.icon || null,
        }));
        createForm.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.transform((data) => ({
            name: data.name,
            color: data.color,
            icon: data.icon || null,
        }));
        editForm.put(update.url(editing), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const handleDestroy = (category: Category) => {
        if (
            !confirm(
                'Tem certeza que deseja excluir esta categoria? Transações serão movidas para Outros.',
            )
        ) {
            return;
        }

        router.delete(destroy.url(category), { preserveScroll: true });
    };

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CategoryFlashMessages flash={flash} />
                <CategoriesHeader onNewCategory={openCreate} />
                <SortableCategoryList
                    categories={categories}
                    onEdit={openEdit}
                    onDelete={handleDestroy}
                />
            </div>

            <CategoryCreateDialog
                categoryIcons={categoryIcons}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={submitCreate}
                onCancel={() => setCreateOpen(false)}
                values={createForm.data}
                errors={
                    createForm.errors as Partial<
                        Record<keyof typeof createForm.data, string>
                    >
                }
                onFieldChange={(field, value) =>
                    createForm.setData(field, value as never)
                }
                processing={createForm.processing}
            />

            <CategoryEditDialog
                categoryIcons={categoryIcons}
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                onSubmit={submitEdit}
                onCancel={() => setEditing(null)}
                values={editForm.data}
                errors={
                    editForm.errors as Partial<
                        Record<keyof typeof editForm.data, string>
                    >
                }
                onFieldChange={(field, value) =>
                    editForm.setData(field, value as never)
                }
                processing={editForm.processing}
            />
        </>
    );
}
