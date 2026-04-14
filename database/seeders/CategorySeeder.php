<?php

namespace Database\Seeders;

use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->chunkById(100, function ($users): void {
            foreach ($users as $user) {
                UserObserver::provisionDefaultCategories($user);
            }
        });
    }

    /**
     * Default category rows applied to users (registration + backfill seeder).
     *
     * @return list<array{name: string, color: string, icon: string}>
     */
    public static function defaults(): array
    {
        return [
            ['name' => 'Food', 'color' => '#ef4444', 'icon' => 'utensils'],
            ['name' => 'Transport', 'color' => '#f59e0b', 'icon' => 'car'],
            ['name' => 'Housing', 'color' => '#3b82f6', 'icon' => 'house'],
            ['name' => 'Health', 'color' => '#22c55e', 'icon' => 'heart-pulse'],
            ['name' => 'Leisure', 'color' => '#8b5cf6', 'icon' => 'gamepad-2'],
            ['name' => 'Education', 'color' => '#06b6d4', 'icon' => 'graduation-cap'],
            ['name' => 'Shopping', 'color' => '#ec4899', 'icon' => 'shopping-bag'],
            ['name' => 'Subscriptions', 'color' => '#f97316', 'icon' => 'repeat'],
            ['name' => 'Other', 'color' => '#6b7280', 'icon' => 'circle-ellipsis'],
        ];
    }
}
