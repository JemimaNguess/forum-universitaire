<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sujet extends Model
{
    protected $table = 'sujets';

    protected $fillable = [
        'titre',
        'contenu',
        'statut',
        'user_id',
        'categorie_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}