<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MessagePrive;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MessagerieController extends Controller
{
    // ── Liste des conversations ───────────────────
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $derniersMessages = MessagePrive::where('expediteur_id', $userId)
            ->orWhere('destinataire_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        $conversations = [];

        foreach ($derniersMessages as $msg) {
            $autreId = $msg->expediteur_id === $userId ? $msg->destinataire_id : $msg->expediteur_id;

            if (!isset($conversations[$autreId])) {
                $autre = User::find($autreId);
                $nonLus = MessagePrive::where('expediteur_id', $autreId)
                    ->where('destinataire_id', $userId)
                    ->whereNull('lu_at')
                    ->count();

                $conversations[$autreId] = [
                    'utilisateur'      => $autre,
                    'dernier_message'  => $msg,
                    'non_lus'          => $nonLus,
                ];
            }
        }

        return response()->json(array_values($conversations));
    }

    // ── Liste des messages d'une conversation ─────
    public function messages(Request $request, $autreUserId)
    {
        $userId = $request->user()->id;

        $messages = MessagePrive::where(function ($q) use ($userId, $autreUserId) {
            $q->where('expediteur_id', $userId)
              ->where('destinataire_id', $autreUserId);
        })->orWhere(function ($q) use ($userId, $autreUserId) {
            $q->where('expediteur_id', $autreUserId)
              ->where('destinataire_id', $userId);
        })
        ->orderBy('created_at')
        ->get();

        // Marquer comme lus
        MessagePrive::where('expediteur_id', $autreUserId)
            ->where('destinataire_id', $userId)
            ->whereNull('lu_at')
            ->update(['lu_at' => now()]);

        return response()->json($messages);
    }

    // ── Envoyer un message texte ──────────────────
    public function envoyer(Request $request)
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'contenu'         => 'required|string',
        ]);

        $message = MessagePrive::create([
            'contenu'         => $request->contenu,
            'type'            => 'texte',
            'expediteur_id'   => $request->user()->id,
            'destinataire_id' => $request->destinataire_id,
        ]);

        return response()->json($message->load(['expediteur', 'destinataire']), 201);
    }

    // ── Envoyer une note vocale ────────────────────
    public function envoyerVocal(Request $request)
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'fichier'         => 'required|file|max:5120',
            'duree'           => 'required|integer',
        ]);

        $path = $request->file('fichier')->store('vocaux', 'public');

        $message = MessagePrive::create([
            'type'            => 'vocal',
            'fichier'         => $path,
            'duree'           => $request->duree,
            'expediteur_id'   => $request->user()->id,
            'destinataire_id' => $request->destinataire_id,
        ]);

        return response()->json($message->load(['expediteur', 'destinataire']), 201);
    }

    // ── Supprimer un message ──────────────────────
    public function supprimerMessage(Request $request, $id)
    {
        $message = MessagePrive::findOrFail($id);

        if ($message->expediteur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($message->fichier && Storage::disk('public')->exists($message->fichier)) {
            Storage::disk('public')->delete($message->fichier);
        }

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    // ── Supprimer une conversation entière ────────
    public function supprimerConversation(Request $request, $autreUserId)
    {
        $userId = $request->user()->id;

        MessagePrive::where(function ($q) use ($userId, $autreUserId) {
            $q->where('expediteur_id', $userId)->where('destinataire_id', $autreUserId);
        })->orWhere(function ($q) use ($userId, $autreUserId) {
            $q->where('expediteur_id', $autreUserId)->where('destinataire_id', $userId);
        })->delete();

        return response()->json(['message' => 'Conversation supprimée.']);
    }

    // ── Liste des utilisateurs pour démarrer une conversation ─
    public function utilisateursDisponibles(Request $request)
    {
        $users = User::where('id', '!=', $request->user()->id)
                     ->select('id', 'nom', 'prenom', 'email', 'avatar')
                     ->with('roles')
                     ->get()
                     ->map(function ($u) {
                         return [
                             'id'     => $u->id,
                             'nom'    => $u->nom,
                             'prenom' => $u->prenom,
                             'email'  => $u->email,
                             'avatar' => $u->avatar,
                             'role'   => $u->getRoleNames()->first(),
                         ];
                     });

        return response()->json($users);
    }

    // Dans MessagerieController.php
    public function totalNonLus(Request $request)
    {
        $total = MessagePrive::where('destinataire_id', $request->user()->id)
            ->whereNull('lu_at')
            ->count();

        return response()->json(['total' => $total]);
    }
}