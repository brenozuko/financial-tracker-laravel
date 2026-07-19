import type { Category } from '@/features/categories/types';

export function displayCategoryName(category: Category): string {
    return category.name === 'Other' ? 'Outros' : category.name;
}
