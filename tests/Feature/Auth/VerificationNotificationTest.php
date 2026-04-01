<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

beforeEach(function () {
    test()->skipUnlessFortifyHas(Features::emailVerification());
});

it('sends a verification notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    actingAs($user);

    post(route('verification.send'))->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmail::class);
});

it('does not send a verification notification when the email is already verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    actingAs($user);

    post(route('verification.send'))->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});
