<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtudiantAutorise extends Model
{
    protected $table = 'etudiants_autorises';

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'email',
        'statut',
    ];
}