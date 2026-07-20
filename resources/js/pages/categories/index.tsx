import { router } from '@inertiajs/react';
import { useState } from 'react';
import { destroy } from '@/actions/App/Http/Controllers/CategoryController';
import { CategoriesHeader } from '@/features/categories/components/categories-header';
import { CategoryCardGrid } from '@/features/categories/components/category-card-grid';
import { CategoryFlashMessages } from '@/features/categories/components/category-flash-messages';
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
    const [search, setSearch] = useState('');

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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <CategoryFlashMessages flash={flash} />
            <CategoriesHeader search={search} onSearchChange={setSearch} />
            <CategoryCardGrid
                categories={categories}
                categoryIcons={categoryIcons}
                search={search}
                onDelete={handleDestroy}
            />
        </div>
    );
}
