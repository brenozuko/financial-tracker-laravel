<?php

use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

it('returns a successful response for the home route', function () {
    $response = get(route('home'));

    $response->assertSuccessful();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login'),
    );
});
