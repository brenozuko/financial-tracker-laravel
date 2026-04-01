<?php

use Laravel\Fortify\Features;

use function Pest\Laravel\assertAuthenticated;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    test()->skipUnlessFortifyHas(Features::registration());
});

it('renders the registration screen', function () {
    get(route('register'))->assertSuccessful();
});

it('registers new users', function () {
    $response = post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
