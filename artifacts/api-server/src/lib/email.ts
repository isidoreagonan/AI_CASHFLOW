import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = "IA CASH FLOW <noreply@aicashflow.site>";
const REPLY_TO = "support@aicashflow.site";
const APP_URL = process.env.APP_URL ||
  (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://aicashflow.site");

// ─── Layout : fond blanc, typographie sobre pour éviter les filtres anti-spam
function emailWrapper(content: string, textContent: string) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IA CASH FLOW</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#7c3aed;border-radius:12px;padding:10px 20px;">
                  <span style="color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.5px;">IA CASH FLOW</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN CARD -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 0 0;" align="center">
            <p style="color:#71717a;font-size:12px;margin:0;line-height:1.6;">
              IA CASH FLOW &mdash; Formation en ligne<br>
              <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">aicashflow.site</a>
              &nbsp;&bull;&nbsp;
              <a href="mailto:support@aicashflow.site" style="color:#7c3aed;text-decoration:none;">support@aicashflow.site</a>
            </p>
            <p style="color:#a1a1aa;font-size:11px;margin:8px 0 0;">
              Vous recevez cet email car votre adresse a ete utilisee pour creer un compte sur IA CASH FLOW.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { html, text: textContent };
}

// ─── Email 1 : Invitation + creation de mot de passe
export async function sendInvitationEmail({
  email,
  firstName,
  setupToken,
  courseTitle,
}: {
  email: string;
  firstName: string;
  setupToken: string;
  courseTitle: string;
}) {
  const setupUrl = `${APP_URL}/configurer-compte?token=${setupToken}`;

  if (!resend) {
    console.log(`[EMAIL] Invitation pour ${email} : ${setupUrl}`);
    return;
  }

  const htmlContent = `
    <h2 style="color:#18181b;margin:0 0 6px;font-size:22px;font-weight:800;">Bienvenue, ${firstName} !</h2>
    <p style="color:#7c3aed;margin:0 0 24px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Votre acces est confirme</p>

    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Vous avez ete invite(e) a rejoindre la formation <strong style="color:#18181b;">${courseTitle}</strong> sur la plateforme IA CASH FLOW.
    </p>

    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Cliquez sur le bouton ci-dessous pour creer votre mot de passe et acceder immediatement a votre formation :
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${setupUrl}"
             style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">
            Creer mon mot de passe
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f4f4f5;border-radius:8px;padding:12px 16px;">
          <p style="color:#52525b;font-size:12px;margin:0;line-height:1.6;">
            Ce lien est valable <strong>48 heures</strong>. Ne le partagez pas, il est personnel.<br>
            Si vous n'attendiez pas cet email, ignorez-le simplement.
          </p>
        </td>
      </tr>
    </table>

    <p style="color:#a1a1aa;font-size:12px;margin:0;">
      Probleme avec le bouton ? Copiez ce lien dans votre navigateur :<br>
      <a href="${setupUrl}" style="color:#7c3aed;word-break:break-all;">${setupUrl}</a>
    </p>
  `;

  const textContent = `Bonjour ${firstName},

Vous avez ete invite(e) a rejoindre la formation "${courseTitle}" sur IA CASH FLOW.

Pour creer votre mot de passe et acceder a votre formation, visitez ce lien :
${setupUrl}

Ce lien expire dans 48 heures. Ne le partagez pas, il est personnel.

Si vous n'attendiez pas cet email, ignorez-le.

---
IA CASH FLOW | aicashflow.site
Support : support@aicashflow.site`;

  const { html, text } = emailWrapper(htmlContent, textContent);

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `Votre acces a "${courseTitle}" est pret - IA CASH FLOW`,
    html,
    text,
  });
}

// ─── Email 2 : Acces accorde (compte deja existant)
export async function sendAccessGrantedEmail({
  email,
  firstName,
  courseTitle,
}: {
  email: string;
  firstName: string;
  courseTitle: string;
}) {
  const loginUrl = `${APP_URL}/login`;

  if (!resend) {
    console.log(`[EMAIL] Acces accorde a ${email} pour "${courseTitle}"`);
    return;
  }

  const htmlContent = `
    <h2 style="color:#18181b;margin:0 0 6px;font-size:22px;font-weight:800;">Bonne nouvelle, ${firstName} !</h2>
    <p style="color:#059669;margin:0 0 24px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Acces accorde</p>

    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 20px;">
      L'administrateur vous a donne acces a la formation <strong style="color:#18181b;">${courseTitle}</strong>.
    </p>

    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Connectez-vous avec votre email et votre mot de passe pour commencer :
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${loginUrl}"
             style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">
            Acceder a ma formation
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#a1a1aa;font-size:12px;margin:0;">
      Lien de connexion : <a href="${loginUrl}" style="color:#7c3aed;">${loginUrl}</a>
    </p>
  `;

  const textContent = `Bonjour ${firstName},

Votre acces a la formation "${courseTitle}" sur IA CASH FLOW a ete accorde.

Connectez-vous ici :
${loginUrl}

---
IA CASH FLOW | aicashflow.site
Support : support@aicashflow.site`;

  const { html, text } = emailWrapper(htmlContent, textContent);

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `Acces accorde a "${courseTitle}" - IA CASH FLOW`,
    html,
    text,
  });
}

// ─── Email 3 : Code de reinitialisation du mot de passe
export async function sendPasswordResetEmail({
  email,
  firstName,
  resetCode,
}: {
  email: string;
  firstName: string;
  resetCode: string;
}) {
  if (!resend) {
    console.log(`[EMAIL] Code reinitialisation pour ${email} : ${resetCode}`);
    return;
  }

  const digits = resetCode.split("");

  const htmlContent = `
    <h2 style="color:#18181b;margin:0 0 6px;font-size:22px;font-weight:800;">Code de verification</h2>
    <p style="color:#f97316;margin:0 0 24px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Reinitialisation du mot de passe</p>

    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 8px;">
      Bonjour <strong style="color:#18181b;">${firstName}</strong>,
    </p>
    <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Voici votre code de verification a 6 chiffres pour reinitialiser votre mot de passe :
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              ${digits.map(d => `
              <td style="padding:0 4px;">
                <div style="width:48px;height:60px;background:#f4f4f5;border:2px solid #e4e4e7;border-radius:8px;text-align:center;line-height:60px;">
                  <span style="color:#18181b;font-size:28px;font-weight:900;">${d}</span>
                </div>
              </td>`).join("")}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;">
          <p style="color:#92400e;font-size:13px;margin:0;line-height:1.6;">
            Ce code expire dans <strong>15 minutes</strong>.<br>
            Ne communiquez jamais ce code — IA CASH FLOW ne vous le demandera jamais.
          </p>
        </td>
      </tr>
    </table>

    <p style="color:#a1a1aa;font-size:12px;margin:0;">
      Si vous n'avez pas demande cette reinitialisation, ignorez cet email. Votre mot de passe reste inchange.
    </p>
  `;

  const textContent = `Bonjour ${firstName},

Voici votre code de reinitialisation de mot de passe IA CASH FLOW :

${resetCode}

Ce code expire dans 15 minutes. Ne le communiquez a personne.

Si vous n'avez pas demande cette reinitialisation, ignorez cet email.

---
IA CASH FLOW | aicashflow.site`;

  const { html, text } = emailWrapper(htmlContent, textContent);

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `Votre code de verification IA CASH FLOW : ${resetCode}`,
    html,
    text,
  });
}
