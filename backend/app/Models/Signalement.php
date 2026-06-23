<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signalement extends Model
{
    protected $table = 'signalements';

    protected $fillable = [
        'raison',
        'statut',
        'auteur_id',
        'message_id',
    ];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}