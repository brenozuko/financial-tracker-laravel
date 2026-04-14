<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('includes mustVerifyEmail on the profile settings page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    actingAs($user);

    get(route('profile.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('mustVerifyEmail', true),
        );
});
