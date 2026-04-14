<?php

use App\Models\User;
use Database\Seeders\CategorySeeder;

it('creates default categories when a user is created', function () {
    $user = User::factory()->create();

    expect($user->categories()->count())->toBe(9)
        ->and($user->categories()->where('is_default', true)->count())->toBe(9)
        ->and($user->categories()->ordered()->first()->name)->toBe('Food');
});

it('seeds default categories for users missing them', function () {
    $user = User::withoutEvents(fn () => User::factory()->create());

    expect($user->categories()->count())->toBe(0);

    (new CategorySeeder)->run();

    expect($user->fresh()->categories()->count())->toBe(9);
});

it('exposes default category templates from the seeder', function () {
    $defaults = CategorySeeder::defaults();

    expect($defaults)->toHaveCount(9)
        ->and($defaults[0]['name'])->toBe('Food')
        ->and(array_column($defaults, 'name'))->each->toBeString()
        ->and(array_column($defaults, 'color'))->each->toStartWith('#')
        ->and(array_column($defaults, 'icon'))->each->toBeString();
});
