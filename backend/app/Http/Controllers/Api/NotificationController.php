<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // ── Liste notifications de l'utilisateur ─────
    public function index(Request $request)
    {
        $query = Notification::where('destinataire_id', $request->user()->id)
                             ->orderByDesc('created_at');

        if ($request->statut === 'non_lues') {
            $query->whereNull('read_at');
        }

        return response()->json($query->get());
    }

    // ── Marquer comme lu ──────────────────────────
    public function marquerLu(Request $request, $id)
    {
        $notification = Notification::where('id', $id)
                                    ->where('destinataire_id', $request->user()->id)
                                    ->firstOrFail();

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    // ── Marquer toutes comme lues ─────────────────
    public function marquerToutLu(Request $request)
    {
        Notification::where('destinataire_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    // ── Supprimer une notification ────────────────
    public function destroy(Request $request, $id)
    {
        $notification = Notification::where('id', $id)
                                    ->where('destinataire_id', $request->user()->id)
                                    ->firstOrFail();

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }
}