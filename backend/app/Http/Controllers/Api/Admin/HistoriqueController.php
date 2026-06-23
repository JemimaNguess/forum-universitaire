<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Historique;

class HistoriqueController extends Controller
{
    // ── Liste de l'historique ────────────────────
    public function index(Request $request)
    {
        $query = Historique::with('admin')
                           ->orderByDesc('created_at');

        if ($request->periode === 'aujourd_hui') {
            $query->whereDate('created_at', today());
        } elseif ($request->periode === 'semaine') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($request->periode === 'mois') {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        return response()->json($query->get());
    }
}