import type { Category } from '@/features/categories/types';

const QUICK_CATEGORY_NAME_PATTERN = /^Nova categoria (\d+)$/;

export function nextQuickCategoryName(categories: Category[]): string {
    let max = 0;

    for (const category of categories) {
        const match = QUICK_CATEGORY_NAME_PATTERN.exec(category.name);

        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }

    return `Nova categoria ${max + 1}`;
}
