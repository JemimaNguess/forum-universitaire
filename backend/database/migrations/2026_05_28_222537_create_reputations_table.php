<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reputations', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('score')->default(0);
            $table->string('badge')->default('Débutant');
            $table->foreignId('utilisateur_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
