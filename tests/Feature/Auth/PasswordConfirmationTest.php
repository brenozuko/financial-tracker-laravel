<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('renders the confirm password screen', function () {
    /** @var User $user */
    $user = User::factory()->create();

    actingAs($user);

    $response = get(route('password.confirm'));

    $response->assertSuccessful();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/confirm-password'),
    );
});

it('requires authentication to confirm password', function () {
    get(route('password.confirm'))->assertRedirect(route('login'));
});
