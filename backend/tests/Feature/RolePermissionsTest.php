<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class RolePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_create_resource(): void
    {
        $student = User::factory()->create([
            'email' => 'student@example.com',
        ]);
        $student->assignRole('etudiant');

        $category = \App\Models\Categorie::create([
            'nom' => 'Test',
            'description' => 'Desc',
        ]);

        $response = $this->actingAs($student, 'sanctum')->postJson('/api/ressources', [
            'titre' => 'Texte',
            'categorie_id' => $category->id,
            'fichier' => UploadedFile::fake()->create('resource.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(403);
    }

    public function test_teacher_can_create_resource_with_valid_payload(): void
    {
        $teacher = User::factory()->create([
            'email' => 'teacher@example.com',
        ]);
        $teacher->assignRole('enseignant');

        $category = \App\Models\Categorie::create([
            'nom' => 'Test',
            'description' => 'Desc',
        ]);

        $response = $this->actingAs($teacher, 'sanctum')->postJson('/api/ressources', [
            'titre' => 'Titre ressource',
            'categorie_id' => $category->id,
            'fichier' => UploadedFile::fake()->create('resource.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201);
    }
}
