<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Support\DefaultUserCategories;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CategoryService
{
    /**
     * @return Collection<int, Category>
     */
    public function listOrderedForUser(User $user): Collection
    {
        return $user->categories()->ordered()->get();
    }

    /**
     * @param  array{name: string, color: string, icon?: string|null, sort_order?: int|null}  $data
     */
    public function store(User $user, array $data): Category
    {
        $maxSort = (int) $user->categories()->max('sort_order');

        return $user->categories()->create([
            'name' => $data['name'],
            'color' => $data['color'],
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? ($maxSort + 1),
        ]);
    }

    /**
     * @param  array{name: string, color: string, icon?: string|null, sort_order?: int|null}  $data
     */
    public function update(Category $category, array $data): Category
    {
        $category->update([
            'name' => $data['name'],
            'color' => $data['color'],
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? $category->sort_order,
        ]);

        return $category->fresh();
    }

    public function deleteOrFail(Category $category): void
    {
        if (! $category->transactions()->exists()) {
            $category->delete();

            return;
        }

        $other = Category::query()
            ->where('user_id', $category->user_id)
            ->where('id', '!=', $category->id)
            ->where('name', DefaultUserCategories::catchAllName())
            ->first()
            ?? Category::query()
                ->where('user_id', $category->user_id)
                ->where('id', '!=', $category->id)
                ->first();

        if ($other === null) {
            $category->delete();

            return;
        }

        DB::transaction(function () use ($category, $other): void {
            Transaction::query()
                ->where('category_id', $category->id)
                ->update(['category_id' => $other->id]);

            $category->delete();
        });
    }
}
