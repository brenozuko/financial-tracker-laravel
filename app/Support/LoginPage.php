<?php

namespace App\Support;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

final class LoginPage
{
    /**
     * Render the Fortify login Inertia page (shared by / and Fortify's login route).
     */
    public static function inertia(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]);
    }
}
