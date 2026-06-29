<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages_prives', function (Blueprint $table) {
            $table->id();
            $table->text('contenu')->nullable();
            $table->enum('type', ['texte', 'vocal', 'fichier'])->default('texte');
            $table->string('fichier')->nullable();
            $table->unsignedInteger('duree')->nullable();
            $table->timestamp('lu_at')->nullable();
            $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages_prives');
    }
};