<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('contenu');
            $table->enum('type', ['urgente','pedagogique','evenement'])->default('pedagogique');
            $table->boolean('epingle')->default(false);
            $table->timestamp('expire_at')->nullable();
            $table->foreignId('auteur_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
