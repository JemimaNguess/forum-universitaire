<?php

namespace App\Http\Controllers\Api\Etudiant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vote;
use App\Models\Message;
use App\Models\Reputation;

class VoteController extends Controller
{
    // ── Voter pour un message ────────────────────
    public function voter(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
            'type'       => 'required|in:like,dislike',
        ]);

        $message = Message::findOrFail($request->message_id);

        // Empêcher de voter pour son propre message
        if ($message->user_id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas voter pour votre propre message.'], 403);
        }

        // Vérifier si déjà voté
        $voteExistant = Vote::where('auteur_id',  $request->user()->id)
                            ->where('message_id', $request->message_id)
                            ->first();

        if ($voteExistant) {
            if ($voteExistant->type === $request->type) {
                // Annuler le vote
                $voteExistant->delete();
                $this->updateReputation($message->user_id, $request->type, false);
                return response()->json(['message' => 'Vote annulé.']);
            } else {
                // Changer le vote
                $ancienType = $voteExistant->type;
                $voteExistant->update(['type' => $request->type]);
                $this->updateReputation($message->user_id, $ancienType, false);
                $this->updateReputation($message->user_id, $request->type, true);
                return response()->json(['message' => 'Vote modifié.']);
            }
        }

        // Nouveau vote
        Vote::create([
            'type'       => $request->type,
            'auteur_id'  => $request->user()->id,
            'message_id' => $request->message_id,
        ]);

        $this->updateReputation($message->user_id, $request->type, true);

        return response()->json(['message' => 'Vote enregistré.'], 201);
    }

    // ── Mettre à jour la réputation ──────────────
    private function updateReputation($userId, $type, $ajouter)
    {
        $reputation = Reputation::firstOrCreate(
            ['utilisateur_id' => $userId],
            ['score' => 0, 'badge' => 'Débutant']
        );

        $points = $type === 'like' ? 5 : -2;
        if (!$ajouter) $points = -$points;

        $nouveauScore = max(0, $reputation->score + $points);

        $badge = 'Débutant';
        if ($nouveauScore >= 500) $badge = 'Expert';
        elseif ($nouveauScore >= 200) $badge = 'Confirmé';
        elseif ($nouveauScore >= 50) $badge = 'Actif';

        $reputation->update([
            'score' => $nouveauScore,
            'badge' => $badge,
        ]);
    }
}