<?php

namespace App\Observers;

use App\Models\User;
use Database\Seeders\CategorySeeder;

class UserObserver
{
    /**
     * Ensure the user has the default category set (idempotent).
     */
    public static function provisionDefaultCategories(User $user): void
    {
        if ($user->categories()->exists()) {
            return;
        }

        foreach (CategorySeeder::defaults() as $index => $template) {
            $user->categories()->create([
                ...$template,
                'sort_order' => $index,
                'is_default' => true,
            ]);
        }
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        self::provisionDefaultCategories($user);
    }
}
