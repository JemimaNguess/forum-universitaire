<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reputation extends Model
{
    protected $table = 'reputations';

    protected $fillable = [
        'score',
        'badge',
        'utilisateur_id',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}