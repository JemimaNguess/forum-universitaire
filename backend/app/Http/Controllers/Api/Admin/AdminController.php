<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EtudiantAutorise;
use Maatwebsite\Excel\Facades\Excel;

class AdminController extends Controller
{
    // ── Liste des utilisateurs ───────────────────
    public function users(Request $request)
    {
        $query = User::with('roles')->orderByDesc('created_at');

        // Filtre par rôle
        if ($request->role) {
            $query->role($request->role);
        }

        // Filtre par statut
        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        // Recherche
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nom',      'like', "%{$request->search}%")
                  ->orWhere('prenom', 'like', "%{$request->search}%")
                  ->orWhere('email',  'like', "%{$request->search}%");
            });
        }

        $users = $query->get()->map(function($user) {
            return [
                'id'       => $user->id,
                'nom'      => $user->nom,
                'prenom'   => $user->prenom,
                'email'    => $user->email,
                'matricule'=> $user->matricule,
                'filiere'  => $user->filiere,
                'niveau'   => $user->niveau,
                'role'     => $user->getRoleNames()->first(),
                'statut'   => $user->statut,
                'avatar'   => $user->avatar,
                'created_at'=> $user->created_at,
            ];
        });

        return response()->json($users);
    }

    // ── Enseignants en attente ───────────────────
    public function enseignantsEnAttente()
    {
        $enseignants = User::role('enseignant')
                          ->where('statut', 'en_attente')
                          ->orderByDesc('created_at')
                          ->get()
                          ->map(function($user) {
                              return [
                                  'id'        => $user->id,
                                  'nom'       => $user->nom,
                                  'prenom'    => $user->prenom,
                                  'email'     => $user->email,
                                  'matricule' => $user->matricule,
                                  'filiere'   => $user->filiere,
                                  'created_at'=> $user->created_at,
                              ];
                          });

        return response()->json($enseignants);
    }

    // ── Valider un enseignant ────────────────────
    public function validerEnseignant($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'statut'            => 'actif',
            'email_verified_at' => now(),
        ]);

        // TODO : envoyer email confirmation

        return response()->json(['message' => 'Enseignant validé avec succès.']);
    }

    // ── Rejeter un enseignant ────────────────────
    public function rejeterEnseignant($id)
    {
        $user = User::findOrFail($id);
        $user->update(['statut' => 'rejete']);

        // TODO : envoyer email de refus

        return response()->json(['message' => 'Enseignant rejeté.']);
    }

    // ── Bloquer un utilisateur ───────────────────
    public function bloquerUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Impossible de bloquer un admin.'], 403);
        }

        $user->update(['statut' => 'rejete']);

        return response()->json(['message' => 'Utilisateur bloqué.']);
    }

    // ── Réactiver un utilisateur ─────────────────
    public function reactiverUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['statut' => 'actif']);

        return response()->json(['message' => 'Utilisateur réactivé.']);
    }

    // ── Supprimer un utilisateur ─────────────────
    public function supprimerUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Impossible de supprimer un admin.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // ── Import fichier Excel ─────────────────────
    public function importExcel(Request $request)
    {
        $request->validate([
            'fichier' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $fichier = $request->file('fichier');
        $data    = \Maatwebsite\Excel\Facades\Excel::toArray([], $fichier);
        $lignes  = $data[0];

        $header = array_map(function($h) {
            return strtolower(trim($h));
        }, $lignes[0]);

        array_shift($lignes);

        $importes = 0;
        $ignores  = 0;
        $erreurs  = [];

        foreach ($lignes as $index => $row) {
            if (empty(array_filter($row))) continue;

            if (count($header) !== count($row)) {
                $erreurs[] = "Ligne " . ($index + 2) . " ignorée";
                continue;
            }

            $row = array_combine($header, $row);

            if (empty(trim($row['matricule'] ?? ''))) continue;

            $existe = EtudiantAutorise::where('matricule', trim($row['matricule']))->first();

            if (!$existe) {
                EtudiantAutorise::create([
                    'matricule' => trim($row['matricule']),
                    'nom'       => trim($row['nom']),
                    'prenom'    => trim($row['prenom']),
                    'email'     => isset($row['email']) ? trim($row['email']) : null,
                ]);
                $importes++;
            } else {
                $ignores++;
            }
        }

        return response()->json([
            'message'  => 'Import terminé.',
            'importes' => $importes,
            'ignores'  => $ignores,
            'erreurs'  => $erreurs,
        ]);
    }

    // ── Liste étudiants autorisés ────────────────
    public function etudiantsAutorises(Request $request)
    {
        $query = EtudiantAutorise::orderByDesc('created_at');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('matricule', 'like', "%{$request->search}%")
                  ->orWhere('nom',     'like', "%{$request->search}%")
                  ->orWhere('prenom',  'like', "%{$request->search}%");
            });
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->get());
    }

    // ── Statistiques dashboard ───────────────────
    public function statistiques()
    {
        $total       = User::count();
        $etudiants   = User::role('etudiant')->count();
        $enseignants = User::role('enseignant')->count();
        $enAttente   = User::where('statut', 'en_attente')->count();
        $suspendus   = User::where('statut', 'rejete')->count();
        $autorises   = EtudiantAutorise::count();
        $inscrits    = EtudiantAutorise::where('statut', 'utilise')->count();

        return response()->json([
            'total_utilisateurs'   => $total,
            'etudiants'            => $etudiants,
            'enseignants'          => $enseignants,
            'en_attente'           => $enAttente,
            'suspendus'            => $suspendus,
            'etudiants_autorises'  => $autorises,
            'etudiants_inscrits'   => $inscrits,
        ]);
    }
}