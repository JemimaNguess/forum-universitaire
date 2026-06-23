<?php

namespace App\Http\Controllers\Api\Enseignant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Signalement;
use App\Models\Message;

class SignalementController extends Controller
{
    // ── Liste tous les signalements ──────────────
    public function index(Request $request)
    {
        $query = Signalement::with(['auteur', 'message.user', 'message.sujet'])
                            ->orderByDesc('created_at');

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->get());
    }

    // ── Créer un signalement ─────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
            'raison'     => 'required|string|max:500',
        ]);

        // Vérifier si déjà signalé par cet utilisateur
        $existe = Signalement::where('auteur_id',  $request->user()->id)
                             ->where('message_id', $request->message_id)
                             ->first();

        if ($existe) {
            return response()->json(['message' => 'Vous avez déjà signalé ce message.'], 422);
        }

        $signalement = Signalement::create([
            'raison'     => $request->raison,
            'statut'     => 'en_attente',
            'auteur_id'  => $request->user()->id,
            'message_id' => $request->message_id,
        ]);

        return response()->json(
            $signalement->load(['auteur', 'message']),
            201
        );
    }

    // ── Traiter un signalement ───────────────────
    public function traiter(Request $request, $id)
    {
        $signalement = Signalement::with('message')->findOrFail($id);

        $request->validate([
            'action' => 'required|in:ignorer,supprimer',
        ]);

        if ($request->action === 'supprimer') {
            // Supprimer le message signalé
            $signalement->message()->delete();
        }

        $signalement->update(['statut' => 'traite']);

        return response()->json(['message' => 'Signalement traité.']);
    }
}