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
}