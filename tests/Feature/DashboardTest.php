<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests to the login page', function () {
    get(route('dashboard'))->assertRedirect(route('login'));
});

it('allows authenticated users to visit the dashboard', function () {
    actingAs(User::factory()->create());

    get(route('dashboard'))->assertSuccessful();
});
