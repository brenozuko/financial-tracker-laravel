<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Laravel\Fortify\Features;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    test()->skipUnlessFortifyHas(Features::emailVerification());
});

it('renders the email verification screen', function () {
    /** @var User $user */
    $user = User::factory()->unverified()->createOne();

    actingAs($user);

    get(route('verification.notice'))->assertSuccessful();
});

it('verifies the email with a valid signed URL', function () {
    /** @var User $user */
    $user = User::factory()->unverified()->createOne();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
    );

    actingAs($user);

    $response = get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

it('does not verify the email when the hash is invalid', function () {
    /** @var User $user */
    $user = User::factory()->unverified()->createOne();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')],
    );

    actingAs($user);

    get($verificationUrl);

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

it('does not verify the email when the user id is invalid', function () {
    /** @var User $user */
    $user = User::factory()->unverified()->createOne();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => 123, 'hash' => sha1($user->email)],
    );

    actingAs($user);

    get($verificationUrl);

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

it('redirects verified users from the verification notice to the dashboard', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    Event::fake();

    actingAs($user);

    $response = get(route('verification.notice'));

    Event::assertNotDispatched(Verified::class);
    $response->assertRedirect(route('dashboard', absolute: false));
});

it('redirects an already verified user visiting the verification link without firing Verified again', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
    );

    actingAs($user);

    get($verificationUrl)
        ->assertRedirect(route('dashboard', absolute: false).'?verified=1');

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});
