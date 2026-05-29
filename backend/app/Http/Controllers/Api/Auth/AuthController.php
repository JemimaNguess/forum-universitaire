<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EtudiantAutorise;
use App\Mail\CodeVerification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ── Inscription ──────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'nom'                  => 'required|string|max:100',
            'prenom'               => 'required|string|max:100',
            'email'                => 'required|email|unique:users',
            'password'             => 'required|min:8|confirmed',
            'role'                 => 'required|in:etudiant,enseignant',
            'matricule'            => 'required|string',
            'filiere'              => 'required|string',
            'niveau'               => 'required|in:L1,L2,L3,M1,M2',
        ]);

        // Vérification matricule pour étudiant
        if ($request->role === 'etudiant') {
            $autorise = EtudiantAutorise::where('matricule', $request->matricule)
                                        ->where('statut', 'disponible')
                                        ->first();
            if (!$autorise) {
                return response()->json([
                    'message' => 'Matricule non reconnu. Contactez l\'administration.'
                ], 422);
            }
        }

        // Générer le code de vérification
        $code = rand(100000, 999999);

        $user = User::create([
            'nom'               => $request->nom,
            'prenom'            => $request->prenom,
            'email'             => $request->email,
            'password'          => bcrypt($request->password),
            'matricule'         => $request->matricule,
            'filiere'           => $request->filiere,
            'niveau'            => $request->niveau,
            'statut'            => $request->role === 'enseignant' ? 'en_attente' : 'actif',
            'verification_code' => $code,
            'code_expire'       => now()->addMinutes(10),
        ]);

        // Assigner le rôle
        $user->assignRole($request->role);

        // Marquer le matricule comme utilisé
        if ($request->role === 'etudiant') {
            $autorise->update(['statut' => 'utilise']);
        }

        // Envoyer le code par email
        Mail::to($user->email)->send(new CodeVerification($code));

        return response()->json([
            'message' => 'Inscription réussie. Vérifiez votre email.',
        ], 201);
    }

    // ── Vérification email ───────────────────────
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié.'], 400);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'Code incorrect.'], 422);
        }

        if (now()->gt($user->code_expire)) {
            return response()->json(['message' => 'Code expiré. Demandez un nouveau code.'], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'code_expire'       => null,
        ]);

        return response()->json(['message' => 'Email vérifié. Vous pouvez vous connecter.']);
    }

    // ── Renvoyer le code ─────────────────────────
    public function resendCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié.'], 400);
        }

        $code = rand(100000, 999999);

        $user->update([
            'verification_code' => $code,
            'code_expire'       => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new CodeVerification($code));

        return response()->json(['message' => 'Code renvoyé avec succès.']);
    }

    // ── Connexion ────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Email non vérifié.'], 403);
        }

        if ($user->statut === 'en_attente') {
            return response()->json(['message' => 'Compte en attente de validation.'], 403);
        }

        if ($user->statut === 'rejete') {
            return response()->json(['message' => 'Votre demande a été refusée.'], 403);
        }

        $token = $user->createToken('forum-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'user'    => [
                'id'      => $user->id,
                'nom'     => $user->nom,
                'prenom'  => $user->prenom,
                'email'   => $user->email,
                'role'    => $user->getRoleNames()->first(),
                'statut'  => $user->statut,
                'filiere' => $user->filiere,
                'niveau'  => $user->niveau,
                'avatar'  => $user->avatar,
            ],
        ]);
    }

    // ── Déconnexion ──────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    // ── Profil connecté ──────────────────────────
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'      => $user->id,
            'nom'     => $user->nom,
            'prenom'  => $user->prenom,
            'email'   => $user->email,
            'role'    => $user->getRoleNames()->first(),
            'statut'  => $user->statut,
            'filiere' => $user->filiere,
            'niveau'  => $user->niveau,
            'avatar'  => $user->avatar,
            'bio'     => $user->bio,
        ]);
    }

    // ── Modifier profil ──────────────────────────
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom'     => 'sometimes|string|max:100',
            'prenom'  => 'sometimes|string|max:100',
            'bio'     => 'sometimes|string|max:500',
            'filiere' => 'sometimes|string|max:100',
            'niveau'  => 'sometimes|in:L1,L2,L3,M1,M2',
        ]);

        $user->update($request->only(['nom', 'prenom', 'bio', 'filiere', 'niveau']));

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $user,
        ]);
    }

    // ── Changer mot de passe ─────────────────────
    public function changePassword(Request $request)
    {
        $request->validate([
            'ancien_password'  => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->ancien_password, $user->password)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect.'], 422);
        }

        $user->update(['password' => bcrypt($request->password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}