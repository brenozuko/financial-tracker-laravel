<?php

use App\Models\Category;
use App\Models\User;

it('allows viewAny and create for any user', function () {
    $user = User::factory()->create();

    expect($user->can('viewAny', Category::class))->toBeTrue()
        ->and($user->can('create', Category::class))->toBeTrue();
});

it('allows view and update when the category belongs to the user', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    expect($user->can('view', $category))->toBeTrue()
        ->and($user->can('update', $category))->toBeTrue();
});

it('denies view and update when the category belongs to another user', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $category = Category::factory()->for($owner)->create();

    expect($other->can('view', $category))->toBeFalse()
        ->and($other->can('update', $category))->toBeFalse();
});

it('allows delete when the category belongs to the user', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    expect($user->can('delete', $category))->toBeTrue();
});

it('denies delete when the category belongs to another user', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $category = Category::factory()->for($owner)->create();

    expect($other->can('delete', $category))->toBeFalse();
});
