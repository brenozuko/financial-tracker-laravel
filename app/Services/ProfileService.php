<?php

namespace App\Services;

use App\Models\User;

class ProfileService
{
    /**
     * @param  array{name: string, email: string}  $data
     */
    public function updateProfile(User $user, array $data): void
    {
        $user->fill($data);
        $user->save();
    }

    public function deleteUser(User $user): void
    {
        $user->delete();
    }
}
