<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'contenu',
        'user_id',
        'sujet_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sujet()
    {
        return $this->belongsTo(Sujet::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function signalements()
    {
        return $this->hasMany(Signalement::class);
    }
}