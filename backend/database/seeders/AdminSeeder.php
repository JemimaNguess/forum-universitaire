<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]
            ->forgetCachedPermissions();

        Role::create(['name' => 'admin',      'guard_name' => 'web']);
        Role::create(['name' => 'enseignant', 'guard_name' => 'web']);
        Role::create(['name' => 'etudiant',   'guard_name' => 'web']);

        $admin = User::create([
            'nom'               => 'Admin',
            'prenom'            => 'UIYA',
            'email'             => 'admin@uiya.ci',
            'password'          => bcrypt('Admin@2026'),
            'statut'            => 'actif',
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');
    }
}