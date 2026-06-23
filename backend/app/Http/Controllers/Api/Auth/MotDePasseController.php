<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PasswordReset;
use App\Mail\CodeResetPassword;
use Illuminate\Support\Facades\Mail;

class MotDePasseController extends Controller
{
    // ── Demander la réinitialisation ─────────────
    public function forgot(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun compte associé à cet email.'], 404);
        }

        $code = rand(100000, 999999);

        PasswordReset::where('email', $request->email)->delete();

        PasswordReset::create([
            'email'     => $request->email,
            'code'      => $code,
            'expire_at' => now()->addMinutes(10),
        ]);

        Mail::to($request->email)->send(new CodeResetPassword($code));

        return response()->json(['message' => 'Un code de réinitialisation a été envoyé à votre email.']);
    }

    // ── Vérifier le code ──────────────────────────
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $reset = PasswordReset::where('email', $request->email)
                              ->where('code', $request->code)
                              ->first();

        if (!$reset) {
            return response()->json(['message' => 'Code incorrect.'], 422);
        }

        if (now()->gt($reset->expire_at)) {
            return response()->json(['message' => 'Code expiré. Demandez un nouveau code.'], 422);
        }

        return response()->json(['message' => 'Code valide.']);
    }

    // ── Réinitialiser le mot de passe ────────────
    public function reset(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|min:8|confirmed',
        ]);

        $reset = PasswordReset::where('email', $request->email)
                              ->where('code', $request->code)
                              ->first();

        if (!$reset) {
            return response()->json(['message' => 'Code invalide.'], 422);
        }

        if (now()->gt($reset->expire_at)) {
            return response()->json(['message' => 'Code expiré.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => bcrypt($request->password)]);

        $reset->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    // ── Renvoyer le code ──────────────────────────
    public function resendCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun compte associé à cet email.'], 404);
        }

        $code = rand(100000, 999999);

        PasswordReset::where('email', $request->email)->delete();

        PasswordReset::create([
            'email'     => $request->email,
            'code'      => $code,
            'expire_at' => now()->addMinutes(10),
        ]);

        Mail::to($request->email)->send(new CodeResetPassword($code));

        return response()->json(['message' => 'Code renvoyé avec succès.']);
    }
}