<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    protected $table = 'historique';

    protected $fillable = [
        'action',
        'description',
        'admin_id',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // ── Helper pour enregistrer une action ──────
    public static function logger($action, $description, $adminId)
    {
        return self::create([
            'action'      => $action,
            'description' => $description,
            'admin_id'    => $adminId,
        ]);
    }
}