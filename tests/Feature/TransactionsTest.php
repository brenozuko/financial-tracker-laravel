<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests to the login page', function () {
    get(route('transactions'))->assertRedirect(route('login'));
});

it('allows authenticated users to visit the transactions page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    actingAs($user);

    get(route('transactions'))->assertSuccessful();
});
