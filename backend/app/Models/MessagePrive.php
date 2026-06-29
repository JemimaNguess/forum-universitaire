<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessagePrive extends Model
{
    protected $table = 'messages_prives';

    protected $fillable = [
        'contenu',
        'type',
        'fichier',
        'duree',
        'lu_at',
        'expediteur_id',
        'destinataire_id',
    ];

    protected $casts = [
        'lu_at' => 'datetime',
    ];

    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}