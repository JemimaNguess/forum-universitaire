<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'nom',
        'description',
        'slug',
        'icone',
        'couleur',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sujets()
    {
        return $this->hasMany(Sujet::class);
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class);
    }
}