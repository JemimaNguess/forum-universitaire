<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    protected $table = 'password_resets';

    protected $fillable = [
        'email',
        'code',
        'expire_at',
    ];

    protected $casts = [
        'expire_at' => 'datetime',
    ];

    public $timestamps = true;
}