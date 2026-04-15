<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tests\TestCase;

uses(TestCase::class);
it('declares fillable attributes for mass assignment', function () {
    $category = new Category;

    expect($category->getFillable())->toBe([
        'user_id',
        'name',
        'color',
        'icon',
        'sort_order',
    ]);
});

it('belongs to a user', function () {
    $category = new Category;

    expect($category->user())->toBeInstanceOf(BelongsTo::class);
    expect($category->user()->getRelated())->toBeInstanceOf(User::class);
});

it('has many transactions', function () {
    $category = new Category;

    expect($category->transactions())->toBeInstanceOf(HasMany::class);
    expect($category->transactions()->getRelated())->toBeInstanceOf(Transaction::class);
});
