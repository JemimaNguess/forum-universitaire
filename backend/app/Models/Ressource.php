<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    protected $table = 'ressources';

    protected $fillable = [
        'titre',
        'fichier',
        'type_mime',
        'taille',
        'nb_telechargements',
        'auteur_id',
        'categorie_id',
    ];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }
}