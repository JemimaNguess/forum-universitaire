<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CodeVerification extends Mailable
{
    use Queueable, SerializesModels;

    public int $code;

    public function __construct(int $code)
    {
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎓 Forum UIYA — Votre code de vérification',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family:Arial,sans-serif;max-width:500px;margin:auto;'>
                    <div style='background:#7C3AED;padding:24px;text-align:center;border-radius:12px 12px 0 0;'>
                        <h1 style='color:white;margin:0;'>🎓 Forum UIYA</h1>
                        <p style='color:#C4B5FD;margin:8px 0 0;'>Vérification de votre email</p>
                    </div>
                    <div style='background:white;padding:30px;text-align:center;'>
                        <p style='color:#6B7280;'>Voici votre code de vérification :</p>
                        <div style='background:#EDE9FE;border-radius:12px;padding:20px;margin:20px 0;'>
                            <div style='font-size:42px;font-weight:bold;color:#7C3AED;letter-spacing:10px;'>{$this->code}</div>
                            <div style='color:#9CA3AF;font-size:13px;margin-top:8px;'>⏱ Expire dans 10 minutes</div>
                        </div>
                        <p style='color:#6B7280;'>Entrez ce code dans l'application pour activer votre compte.</p>
                    </div>
                    <div style='background:#F5F3FF;padding:16px;text-align:center;border-radius:0 0 12px 12px;'>
                        <p style='color:#9CA3AF;font-size:12px;margin:0;'>Forum Universitaire UIYA · Échangez. Partagez. Apprenez.</p>
                    </div>
                </div>
            ",
        );
    }
}