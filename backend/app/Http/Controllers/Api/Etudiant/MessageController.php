<?php

namespace App\Http\Controllers\Api\Etudiant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Sujet;
use App\Models\Notification;

class MessageController extends Controller
{
    // ── Liste messages d'un sujet ────────────────
    public function index($sujetId)
    {
        $messages = Message::with(['user', 'votes'])
                           ->withCount([
                               'votes as likes'    => fn($q) => $q->where('type', 'like'),
                               'votes as dislikes' => fn($q) => $q->where('type', 'dislike'),
                           ])
                           ->where('sujet_id', $sujetId)
                           ->orderBy('created_at')
                           ->get();

        return response()->json($messages);
    }

    // ── Créer un message ─────────────────────────
    public function store(Request $request, $sujetId)
    {
        $sujet = Sujet::findOrFail($sujetId);

        if ($sujet->statut === 'ferme') {
            return response()->json(['message' => 'Ce sujet est fermé.'], 403);
        }

        $request->validate([
            'contenu' => 'required|string',
        ]);

        $message = Message::create([
            'contenu'  => $request->contenu,
            'user_id'  => $request->user()->id,
            'sujet_id' => $sujetId,
        ]);

        // Notifier l'auteur du sujet
        if ($sujet->user_id !== $request->user()->id) {
            Notification::create([
                'type'            => 'nouvelle_reponse',
                'donnees'         => [
                    'sujet_id'    => $sujet->id,
                    'sujet_titre' => $sujet->titre,
                    'auteur'      => $request->user()->prenom . ' ' . $request->user()->nom,
                ],
                'destinataire_id' => $sujet->user_id,
            ]);
        }

        return response()->json(
            $message->load('user'),
            201
        );
    }

    // ── Modifier un message ──────────────────────
    public function update(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'contenu' => 'required|string',
        ]);

        $message->update(['contenu' => $request->contenu]);

        return response()->json($message);
    }

    // ── Supprimer un message ─────────────────────
    public function destroy(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        if ($message->user_id !== $request->user()->id &&
            !$request->user()->hasRole('admin') &&
            !$request->user()->hasRole('enseignant')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    // ── Utilisateurs disponibles pour messagerie ──
    public function utilisateursDispo(Request $request)
    {
        $users = \App\Models\User::where('id', '!=', $request->user()->id)
                    ->where('statut', 'actif')
                    ->select('id', 'nom', 'prenom', 'email', 'role')
                    ->orderBy('prenom')
                    ->get();

        return response()->json($users);
    }
}