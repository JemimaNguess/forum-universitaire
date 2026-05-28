<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nom')->after('id');
            $table->string('prenom')->after('nom');
            $table->string('matricule')->nullable()->after('email');
            $table->string('filiere')->nullable()->after('matricule');
            $table->string('niveau')->nullable()->after('filiere');
            $table->enum('statut', ['actif','en_attente','rejete'])->default('actif')->after('niveau');
            $table->string('verification_code', 6)->nullable()->after('statut');
            $table->dateTime('code_expire')->nullable()->after('verification_code');
            $table->string('avatar')->nullable()->after('code_expire');
            $table->text('bio')->nullable()->after('avatar');
            $table->dropColumn('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nom','prenom','matricule','filiere','niveau','statut','verification_code','code_expire','avatar','bio']);
            $table->string('name');
        });
    }
};
