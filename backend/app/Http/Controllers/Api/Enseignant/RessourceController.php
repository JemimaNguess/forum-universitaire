<?php

namespace App\Http\Controllers\Api\Enseignant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ressource;
use Illuminate\Support\Facades\Storage;

class RessourceController extends Controller
{
    // ── Liste toutes les ressources ──────────────
    public function index(Request $request)
    {
        $query = Ressource::with(['auteur', 'categorie'])
                          ->orderByDesc('created_at');

        if ($request->categorie_id) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->search) {
            $query->where('titre', 'like', "%{$request->search}%");
        }

        // Si enseignant → seulement ses ressources
        if ($request->user()->hasRole('enseignant')) {
            $query->where('auteur_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    // ── Afficher une ressource ───────────────────
    public function show($id)
    {
        $ressource = Ressource::with(['auteur', 'categorie'])
                              ->findOrFail($id);

        // Incrémenter le compteur de téléchargements
        $ressource->increment('nb_telechargements');

        return response()->json($ressource);
    }

    // ── Créer une ressource ──────────────────────
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('enseignant') && !$user->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'titre'        => 'required|string|max:255',
            'categorie_id' => 'required|exists:categories,id',
            'fichier'      => 'required|file|max:10240', // 10MB max
        ]);

        $fichier   = $request->file('fichier');
        $path      = $fichier->store('ressources', 'public');
        $typeMime  = $fichier->getMimeType();
        $taille    = $fichier->getSize();

        $ressource = Ressource::create([
            'titre'        => $request->titre,
            'fichier'      => $path,
            'type_mime'    => $typeMime,
            'taille'       => $taille,
            'categorie_id' => $request->categorie_id,
            'auteur_id'    => $request->user()->id,
        ]);

        return response()->json(
            $ressource->load(['auteur', 'categorie']),
            201
        );
    }

    // ── Supprimer une ressource ──────────────────
    public function destroy(Request $request, $id)
    {
        $ressource = Ressource::findOrFail($id);

        if ($ressource->auteur_id !== $request->user()->id &&
            !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // Supprimer le fichier physique
        if (Storage::disk('public')->exists($ressource->fichier)) {
            Storage::disk('public')->delete($ressource->fichier);
        }

        $ressource->delete();

        return response()->json(['message' => 'Ressource supprimée.']);
    }
}