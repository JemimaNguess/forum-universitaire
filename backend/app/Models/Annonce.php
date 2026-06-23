<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    protected $table = 'annonces';

    protected $fillable = [
        'titre',
        'contenu',
        'type',
        'epingle',
        'expire_at',
        'auteur_id',
    ];

    protected $casts = [
        'epingle'   => 'boolean',
        'expire_at' => 'datetime',
    ];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }
}