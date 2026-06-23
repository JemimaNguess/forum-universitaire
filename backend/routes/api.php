<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\CategorieController;
use App\Http\Controllers\Api\Etudiant\SujetController;
use App\Http\Controllers\Api\Etudiant\MessageController;
use App\Http\Controllers\Api\Etudiant\VoteController;
use App\Http\Controllers\Api\Enseignant\RessourceController;
use App\Http\Controllers\Api\Enseignant\SignalementController;
use App\Http\Controllers\Api\Enseignant\AnnonceController;
use App\Http\Controllers\Api\Auth\MotDePasseController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\HistoriqueController;



// ── Route non authentifié ─────────────────────
Route::get('/unauthenticated', function () {
    return response()->json(['message' => 'Non authentifié.'], 401);
});

// ── Routes publiques ──────────────────────────
Route::post('/register',      [AuthController::class, 'register']);
Route::post('/verify-email',  [AuthController::class, 'verifyEmail']);
Route::post('/resend-code',   [AuthController::class, 'resendCode']);
Route::post('/login',         [AuthController::class, 'login']);
Route::post('/password/forgot',  [MotDePasseController::class, 'forgot']);
Route::post('/password/verify',  [MotDePasseController::class, 'verifyCode']);
Route::post('/password/reset',   [MotDePasseController::class, 'reset']);
Route::post('/password/resend',  [MotDePasseController::class, 'resendCode']);

// ── Routes protégées ──────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',           [AuthController::class, 'logout']);
    Route::get('/me',                [AuthController::class, 'me']);
    Route::put('/profile',           [AuthController::class, 'updateProfile']);
    Route::put('/change-password',   [AuthController::class, 'changePassword']);

    // Catégories (lecture — tous les rôles)
    Route::get('/categories',        [CategorieController::class, 'index']);
    Route::get('/categories/{id}',   [CategorieController::class, 'show']);

    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/lu',    [NotificationController::class, 'marquerLu']);
    Route::patch('/notifications/tout-lu',    [NotificationController::class, 'marquerToutLu']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);

    // ── Routes Admin ──────────────────────────
    Route::middleware('role:admin')->group(function () {

        // Statistiques
        Route::get('/admin/statistiques',          [AdminController::class, 'statistiques']);

        // Gestion utilisateurs
        Route::get('/admin/users',                 [AdminController::class, 'users']);
        Route::patch('/admin/bloquer/{id}',        [AdminController::class, 'bloquerUser']);
        Route::patch('/admin/reactiver/{id}',      [AdminController::class, 'reactiverUser']);
        Route::delete('/admin/users/{id}',         [AdminController::class, 'supprimerUser']);

        // Validations enseignants
        Route::get('/admin/enseignants-en-attente',[AdminController::class, 'enseignantsEnAttente']);
        Route::patch('/admin/valider/{id}',        [AdminController::class, 'validerEnseignant']);
        Route::patch('/admin/rejeter/{id}',        [AdminController::class, 'rejeterEnseignant']);

        // Import Excel
        Route::post('/admin/import-excel',         [AdminController::class, 'importExcel']);
        Route::get('/admin/etudiants-autorises',   [AdminController::class, 'etudiantsAutorises']);

        // Catégories CRUD
        Route::post('/categories',                 [CategorieController::class, 'store']);
        Route::put('/categories/{id}',             [CategorieController::class, 'update']);
        Route::delete('/categories/{id}',          [CategorieController::class, 'destroy']);

        Route::get('/admin/historique',           [HistoriqueController::class, 'index']);
    });

    

    // ── Routes Étudiant ───────────────────────────
    Route::get('/sujets',                      [SujetController::class, 'index']);
    Route::get('/sujets/{id}',                 [SujetController::class, 'show']);
    Route::post('/sujets',                     [SujetController::class, 'store']);
    Route::put('/sujets/{id}',                 [SujetController::class, 'update']);
    Route::delete('/sujets/{id}',              [SujetController::class, 'destroy']);
    Route::get('/categories/{id}/sujets',      [SujetController::class, 'parCategorie']);

    Route::get('/sujets/{id}/messages',        [MessageController::class, 'index']);
    Route::post('/sujets/{id}/messages',       [MessageController::class, 'store']);
    Route::put('/messages/{id}',               [MessageController::class, 'update']);
    Route::delete('/messages/{id}',            [MessageController::class, 'destroy']);

    Route::post('/votes',                      [VoteController::class, 'voter']);

    // Ressources
    Route::get('/ressources',              [RessourceController::class, 'index']);
    Route::get('/ressources/{id}',         [RessourceController::class, 'show']);
    Route::post('/ressources',             [RessourceController::class, 'store']);
    Route::delete('/ressources/{id}',      [RessourceController::class, 'destroy']);

    // Annonces
    Route::get('/annonces',                [AnnonceController::class, 'index']);
    Route::post('/annonces',               [AnnonceController::class, 'store']);
    Route::put('/annonces/{id}',           [AnnonceController::class, 'update']);
    Route::delete('/annonces/{id}',        [AnnonceController::class, 'destroy']);

    // Signalements
    Route::get('/signalements',            [SignalementController::class, 'index']);
    Route::post('/signalements',           [SignalementController::class, 'store']);
    Route::patch('/signalements/{id}/traiter', [SignalementController::class, 'traiter']);

    // Statut sujet (épingler/fermer) — enseignant et admin
    Route::patch('/sujets/{id}/statut',    [SujetController::class, 'updateStatut']);
});