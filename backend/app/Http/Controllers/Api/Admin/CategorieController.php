<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Categorie;
use Illuminate\Support\Str;
use App\Models\Historique;

class CategorieController extends Controller
{
    // ── Liste toutes les catégories ──────────────
    public function index()
    {
        $categories = Categorie::withCount('sujets')
                               ->orderBy('nom')
                               ->get();
        return response()->json($categories);
    }

    // ── Afficher une catégorie ───────────────────
    public function show($id)
    {
        $categorie = Categorie::withCount('sujets')
                              ->findOrFail($id);
        return response()->json($categorie);
    }

    // ── Créer une catégorie ──────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'nom'         => 'required|string|max:100|unique:categories',
            'description' => 'nullable|string',
            'icone'       => 'nullable|string',
            'couleur'     => 'nullable|string',
        ]);

        $categorie = Categorie::create([
            'nom'         => $request->nom,
            'description' => $request->description,
            'slug'        => Str::slug($request->nom),
            'icone'       => $request->icone,
            'couleur'     => $request->couleur,
            'user_id'     => $request->user()->id,
        ]);

        Historique::logger(
            'creation_categorie',
            "Création de la catégorie {$categorie->nom}",
            $request->user()->id
        );

        return response()->json($categorie, 201);
    }

    // ── Modifier une catégorie ───────────────────
    public function update(Request $request, $id)
    {
        $categorie = Categorie::findOrFail($id);

        $request->validate([
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
            'icone'       => 'nullable|string',
            'couleur'     => 'nullable|string',
        ]);

        $categorie->update([
            'nom'         => $request->nom,
            'description' => $request->description,
            'slug'        => Str::slug($request->nom),
            'icone'       => $request->icone,
            'couleur'     => $request->couleur,
        ]);

        return response()->json($categorie);
    }

    // ── Supprimer une catégorie ──────────────────
    public function destroy(Request $request, $id)
    {
        $categorie = Categorie::findOrFail($id);
        $nom = $categorie->nom;
        $categorie->delete();

        Historique::logger(
            'suppression_categorie',
            "Suppression de la catégorie {$nom}",
            $request->user()->id
        );

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}