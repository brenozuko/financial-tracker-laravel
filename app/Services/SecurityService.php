<?php

namespace App\Services;

use App\Models\User;
use Laravel\Fortify\Features;

class SecurityService
{
    /**
     * Props for the security settings Inertia page (2FA flags and state).
     *
     * @return array{
     *     canManageTwoFactor: bool,
     *     twoFactorEnabled?: bool,
     * }
     */
    public function securitySettingsPageProps(User $user): array
    {
        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $props['twoFactorEnabled'] = $user->hasEnabledTwoFactorAuthentication();
        }

        return $props;
    }

    public function updatePassword(User $user, string $plainPassword): void
    {
        $user->update([
            'password' => $plainPassword,
        ]);
    }
}
