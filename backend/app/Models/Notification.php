<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'type',
        'donnees',
        'destinataire_id',
        'read_at',
    ];

    protected $casts = [
        'donnees' => 'array',
        'read_at' => 'datetime',
    ];

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    // Envoie une notification à un utilisateur précis
    public static function envoyer($destinataireId, $type, $donnees = [])
    {
        return self::create([
            'type'            => $type,
            'donnees'         => $donnees,
            'destinataire_id' => $destinataireId,
        ]);
    }

    // Envoie la même notification à tous les admins
    public static function envoyerAuxAdmins($type, $donnees = [])
    {
        $admins = User::role('admin')->pluck('id');
        foreach ($admins as $adminId) {
            self::envoyer($adminId, $type, $donnees);
        }
    }
}