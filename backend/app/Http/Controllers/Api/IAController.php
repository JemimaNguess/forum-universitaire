<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Sujet;
use App\Models\Message;
use App\Models\User;

class IAController extends Controller
{
    private function callGemini(string $prompt): string
    {
        $response = Http::withoutVerifying()->withHeaders([
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'    => 'llama-3.3-70b-versatile',
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ]);

        if ($response->failed()) {
            throw new \Exception('Erreur API Groq : ' . $response->body());
        }

        return $response->json('choices.0.message.content');
    }

    // ── Assistant Forum ───────────────────────────
    public function assister(Request $request)
    {
        $request->validate(['question' => 'required|string']);

        try {
            $texte = $this->callGemini(
                "Tu es un assistant pédagogique pour des étudiants universitaires en Côte d'Ivoire. " .
                "Réponds de façon claire, concise et bienveillante à cette question académique : " .
                "\"{$request->question}\". Réponds en français, en 3-4 phrases maximum."
            );
            return response()->json(['reponse' => $texte]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }

    // ── Résumé d'un sujet ─────────────────────────
    public function resumer(Request $request)
    {
        $request->validate(['sujet_id' => 'required|exists:sujets,id']);

        $sujet   = Sujet::with('messages')->findOrFail($request->sujet_id);
        $contenu = "Sujet : {$sujet->titre}\n{$sujet->contenu}\n\n";
        foreach ($sujet->messages as $msg) {
            $contenu .= "Réponse : {$msg->contenu}\n";
        }

        try {
            $texte = $this->callGemini(
                "Résume cette discussion de forum universitaire en 3 lignes maximum, en français, " .
                "en gardant les points essentiels :\n\n{$contenu}"
            );
            return response()->json(['resume' => $texte]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }

    // ── Recommandations ───────────────────────────
    public function recommander(Request $request)
    {
        $user = $request->user();

        $sujetsRecents = Sujet::with('categorie')
            ->where('categorie_id', function ($q) use ($user) {
                $q->select('categorie_id')->from('sujets')
                  ->where('user_id', $user->id)
                  ->orderByDesc('created_at')->limit(1);
            })
            ->where('user_id', '!=', $user->id)
            ->orderByDesc('created_at')->limit(5)->get();

        return response()->json(['recommandations' => $sujetsRecents]);
    }

    // ── Amélioration orthographe ──────────────────
    public function ameliorer(Request $request)
    {
        $request->validate(['texte' => 'required|string']);

        try {
            $texte = $this->callGemini(
                "Corrige uniquement les fautes d'orthographe et de grammaire de ce texte français, " .
                "sans changer le sens ni le ton. Retourne uniquement le texte corrigé, sans commentaire :\n\n" .
                "{$request->texte}"
            );
            return response()->json(['texte_corrige' => trim($texte)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }

    // ── Rapport hebdomadaire Admin ────────────────
    public function rapportAdmin(Request $request)
    {
        $totalUtilisateurs    = User::count();
        $nouveauxCetteSemaine = User::where('created_at', '>=', now()->subDays(7))->count();
        $sujetsCetteSemaine   = Sujet::where('created_at', '>=', now()->subDays(7))->count();
        $enAttente            = User::where('statut', 'en_attente')->count();

        $donnees = "Utilisateurs totaux : {$totalUtilisateurs}\n" .
                   "Nouveaux inscrits cette semaine : {$nouveauxCetteSemaine}\n" .
                   "Sujets créés cette semaine : {$sujetsCetteSemaine}\n" .
                   "Enseignants en attente de validation : {$enAttente}";

        try {
            $texte = $this->callGemini(
                "Tu es un assistant pour administrateur de plateforme universitaire. " .
                "Génère un court rapport hebdomadaire en français (5 lignes maximum) à partir de ces données, " .
                "avec une suggestion d'action si pertinent :\n\n{$donnees}"
            );
            return response()->json([
                'rapport' => $texte,
                'stats'   => [
                    'total_utilisateurs' => $totalUtilisateurs,
                    'nouveaux_semaine'   => $nouveauxCetteSemaine,
                    'sujets_semaine'     => $sujetsCetteSemaine,
                    'en_attente'         => $enAttente,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }

    // ── Modération automatique ────────────────────
    public function moderer(Request $request)
    {
        $request->validate(['message_id' => 'required|exists:messages,id']);

        $message = Message::findOrFail($request->message_id);

        try {
            $texte = $this->callGemini(
                "Analyse ce message d'un forum universitaire et indique s'il contient un contenu " .
                "inapproprié (insulte, spam, harcèlement, contenu hors-sujet grave). " .
                "Réponds uniquement par 'OUI' suivi d'une courte raison, ou 'NON' si le message est correct :\n\n" .
                "\"{$message->contenu}\""
            );
            return response()->json(['analyse' => $texte]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }

    // ── Assistant rédaction Enseignant ────────────
    public function assisterRedaction(Request $request)
    {
        $request->validate(['sujet' => 'required|string']);

        try {
            $texte = $this->callGemini(
                "Tu es un assistant pour enseignant universitaire. Propose un plan structuré (titre + " .
                "3-4 points clés) pour une ressource pédagogique sur le sujet suivant, en français : " .
                "\"{$request->sujet}\""
            );
            return response()->json(['suggestion' => $texte]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur IA : ' . $e->getMessage()], 500);
        }
    }
}