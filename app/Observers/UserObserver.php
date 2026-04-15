<?php

namespace App\Observers;

use App\Models\User;
use App\Support\DefaultUserCategories;

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

        foreach (DefaultUserCategories::templates() as $index => $template) {
            $user->categories()->create([
                ...$template,
                'sort_order' => $index,
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
