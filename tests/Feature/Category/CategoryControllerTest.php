<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Support\DefaultUserCategories;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests from the categories index', function () {
    get(route('categories.index'))->assertRedirect();
});

it('shows the categories index for authenticated users', function () {
    /** @var User $user */
    $user = User::factory()->create();

    actingAs($user)
        ->get(route('categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->has('categories'));
});

it('lists categories in sort order', function () {
    /** @var User $user */
    $user = User::factory()->create();
    $ordered = $user->categories()->ordered()->pluck('id')->all();

    actingAs($user)
        ->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories', count($ordered))
            ->where('categories.0.id', $ordered[0]));
});

it('stores a new category', function () {
    /** @var User $user */
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Custom Cat',
            'color' => '#aabbcc',
            'icon' => 'star',
            'sort_order' => 99,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Category::query()->where('user_id', $user->id)->where('name', 'Custom Cat')->exists())->toBeTrue();
});

it('updates a category', function () {
    /** @var User $user */
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'name' => 'Before',
        'color' => '#111111',
    ]);

    actingAs($user)
        ->patch(route('categories.update', $category), [
            'name' => 'After',
            'color' => '#222222',
            'icon' => null,
            'sort_order' => 12,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $category->refresh();

    expect($category->name)->toBe('After')
        ->and($category->color)->toBe('#222222')
        ->and($category->sort_order)->toBe(12);
});

it('deletes a category without transactions', function () {
    /** @var User $user */
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Category::query()->whereKey($category->id)->exists())->toBeFalse();
});

it('reassigns transactions to Other before deleting a category', function () {
    /** @var User $user */
    $user = User::factory()->create();
    $other = $user->categories()->where('name', DefaultUserCategories::catchAllName())->firstOrFail();
    $toDelete = Category::factory()->for($user)->create();

    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'category_id' => $toDelete->id,
    ]);

    actingAs($user)
        ->delete(route('categories.destroy', $toDelete))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($transaction->fresh()->category_id)->toBe($other->id)
        ->and(Category::query()->whereKey($toDelete->id)->exists())->toBeFalse();
});

it('deletes the catch-all category and reassigns its transactions to another category', function () {
    /** @var User $user */
    $user = User::factory()->create();
    $catchAll = $user->categories()->where('name', DefaultUserCategories::catchAllName())->firstOrFail();
    $fallback = $user->categories()->where('id', '!=', $catchAll->id)->firstOrFail();

    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'category_id' => $catchAll->id,
    ]);

    actingAs($user)
        ->delete(route('categories.destroy', $catchAll))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($transaction->fresh()->category_id)->toBe($fallback->id)
        ->and(Category::query()->whereKey($catchAll->id)->exists())->toBeFalse();
});
