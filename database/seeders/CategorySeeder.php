<?php

namespace Database\Seeders;

use App\Models\User;
use App\Observers\UserObserver;
use App\Support\DefaultUserCategories;
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
        return DefaultUserCategories::templates();
    }
}
