import resend from '../lib/resend';
import { AppError } from '../utils/AppError';

// Resend's shared testing sender. Works without domain verification, but ONLY
// delivers to the email address that owns the Resend account. In production,
// swap this for an address on your own verified domain (e.g. no-reply@diettracker.app).
const FROM = 'DietTracker <onboarding@resend.dev>';

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: 'Reset hasła — DietTracker',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
                <h2>Reset hasła</h2>
                <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w DietTracker.</p>
                <p>Kliknij poniższy przycisk, aby ustawić nowe hasło. Link jest ważny przez 30 minut.</p>
                <p style="margin: 24px 0;">
                    <a href="${resetLink}"
                       style="background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Ustaw nowe hasło
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość — Twoje hasło pozostanie bez zmian.
                </p>
            </div>
        `,
    });

    // Resend returns errors in the payload (it does not throw). Surface it so the
    // caller can decide what to do — we do not want silent email failures.
    if (error) {
        // Log the real reason from Resend (invalid key, unverified sender, test-mode
        // recipient restriction, ...). Without it we are debugging blind.
        console.error('Resend error:', error);
        throw new AppError(`Failed to send password reset email: ${error.message}`, 500);
    }
};
