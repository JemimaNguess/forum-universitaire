<?php

namespace App\Http\Controllers\Api\Etudiant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sujet;
use App\Models\Categorie;

class SujetController extends Controller
{
    // ── Liste tous les sujets ────────────────────
    public function index(Request $request)
    {
        $query = Sujet::with(['user', 'categorie'])
                      ->withCount('messages')
                      ->orderByDesc('created_at');

        if ($request->categorie_id) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('titre',   'like', "%{$request->search}%")
                  ->orWhere('contenu', 'like', "%{$request->search}%");
            });
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->get());
    }

    // ── Afficher un sujet ────────────────────────
    public function show($id)
    {
        $sujet = Sujet::with(['user', 'categorie', 'messages.user', 'messages.votes'])
                      ->withCount('messages')
                      ->findOrFail($id);

        return response()->json($sujet);
    }

    // ── Créer un sujet ───────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'titre'        => 'required|string|max:255',
            'contenu'      => 'required|string',
            'categorie_id' => 'required|exists:categories,id',
        ]);

        $sujet = Sujet::create([
            'titre'        => $request->titre,
            'contenu'      => $request->contenu,
            'categorie_id' => $request->categorie_id,
            'user_id'      => $request->user()->id,
            'statut'       => 'ouvert',
        ]);

        return response()->json(
            $sujet->load(['user', 'categorie']),
            201
        );
    }

    // ── Modifier un sujet ────────────────────────
    public function update(Request $request, $id)
    {
        $sujet = Sujet::findOrFail($id);

        if ($sujet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'titre'   => 'sometimes|string|max:255',
            'contenu' => 'sometimes|string',
        ]);

        $sujet->update($request->only(['titre', 'contenu']));

        return response()->json($sujet);
    }

    // ── Supprimer un sujet ───────────────────────
    public function destroy(Request $request, $id)
    {
        $sujet = Sujet::findOrFail($id);

        if ($sujet->user_id !== $request->user()->id &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $sujet->delete();

        return response()->json(['message' => 'Sujet supprimé.']);
    }

    // ── Sujets par catégorie ─────────────────────
    public function parCategorie($categorieId)
    {
        $categorie = Categorie::findOrFail($categorieId);

        $sujets = Sujet::with(['user'])
                       ->withCount('messages')
                       ->where('categorie_id', $categorieId)
                       ->orderByDesc('created_at')
                       ->get();

        return response()->json([
            'categorie' => $categorie,
            'sujets'    => $sujets,
        ]);
    }

    // ── Modifier le statut d'un sujet ────────────
    public function updateStatut(Request $request, $id)
    {
        $sujet = Sujet::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:ouvert,ferme,epingle',
        ]);

        if (!$request->user()->hasRole('enseignant') &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $sujet->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut mis à jour.', 'sujet' => $sujet]);
    }
}