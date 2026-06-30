<?php

namespace App\Http\Controllers\Api\Enseignant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Annonce;

class AnnonceController extends Controller
{
    // ── Liste toutes les annonces ────────────────
    public function index(Request $request)
    {
        $query = Annonce::with('auteur')
                        ->orderByDesc('epingle')
                        ->orderByDesc('created_at');

        // Filtrer les annonces non expirées
        $query->where(function($q) {
            $q->whereNull('expire_at')
              ->orWhere('expire_at', '>', now());
        });

        return response()->json($query->get());
    }

    // ── Créer une annonce ────────────────────────
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('enseignant') && !$user->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'titre'     => 'required|string|max:255',
            'contenu'   => 'required|string',
            'type'      => 'required|in:urgente,pedagogique,evenement',
            'epingle'   => 'boolean',
            'expire_at' => 'nullable|date|after:now',
        ]);

        $annonce = Annonce::create([
            'titre'     => $request->titre,
            'contenu'   => $request->contenu,
            'type'      => $request->type,
            'epingle'   => $request->epingle ?? false,
            'expire_at' => $request->expire_at,
            'auteur_id' => $request->user()->id,
        ]);

        return response()->json(
            $annonce->load('auteur'),
            201
        );
    }

    // ── Modifier une annonce ─────────────────────
    public function update(Request $request, $id)
    {
        $annonce = Annonce::findOrFail($id);

        if (!$request->user()->hasRole('enseignant') && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($annonce->auteur_id !== $request->user()->id &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'titre'     => 'sometimes|string|max:255',
            'contenu'   => 'sometimes|string',
            'type'      => 'sometimes|in:urgente,pedagogique,evenement',
            'epingle'   => 'boolean',
            'expire_at' => 'nullable|date',
        ]);

        $annonce->update($request->only([
            'titre', 'contenu', 'type', 'epingle', 'expire_at'
        ]));

        return response()->json($annonce);
    }

    // ── Supprimer une annonce ────────────────────
    public function destroy(Request $request, $id)
    {
        $annonce = Annonce::findOrFail($id);

        if (!$request->user()->hasRole('enseignant') && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($annonce->auteur_id !== $request->user()->id &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $annonce->delete();

        return response()->json(['message' => 'Annonce supprimée.']);
    }
}