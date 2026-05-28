<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'matricule',
        'filiere',
        'niveau',
        'statut',
        'verification_code',
        'code_expire',
        'email_verified_at',
        'avatar',
        'bio',
    ];

    protected $hidden = [
        'password',
        'verification_code',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'code_expire'       => 'datetime',
    ];
}