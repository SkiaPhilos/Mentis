import nodemailer from 'nodemailer';

export interface ScholarNotificationData {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  program: string;
  educationType?: string;
  appliedAt?: string;
}

export interface MailerResult {
  success: boolean;
  configured: boolean;
  messageId?: string;
  error?: string;
  details?: string;
}

/**
 * Validates whether Google SMTP credentials are present in server environment.
 */
export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(user && pass);
}

/**
 * Creates a Nodemailer transport configured for Google SMTP.
 * Default Host: smtp.gmail.com
 * Default Port: 465 (secure SSL) or 587 (STARTTLS)
 */
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim()?.replace(/\s+/g, ''); // Google App Passwords often contain spaces

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatches a formal Matriculation Petition notification email to the owner.
 */
export async function sendScholarRegistrationNotification(
  scholar: ScholarNotificationData
): Promise<MailerResult> {
  const transporter = createSmtpTransporter();
  const ownerEmail = process.env.OWNER_EMAIL || 'abdullahsaeed.sam@gmail.com';
  const fromEmail = process.env.SMTP_FROM || `Mentis Sanctuary <${process.env.SMTP_USER || 'no-reply@mentis.academic'}>`;
  const appUrl = process.env.APP_URL || 'https://mentis.academic';

  if (!transporter) {
    return {
      success: false,
      configured: false,
      error: 'Google SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in environment variables.',
      details: 'Please provide your Google account email and 16-character Google App Password in Settings/env.',
    };
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Scholar Matriculation Petition — Mentis</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3EEDB; font-family: 'Times New Roman', Times, Georgia, serif; color: #173B2D;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3EEDB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF7EE; border: 1px solid #D6C8A7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(23, 59, 45, 0.08);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #173B2D; padding: 32px; text-align: center; border-bottom: 2px solid #B59A62;">
              <h1 style="color: #FAF7EE; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: normal;">
                MENTIS
              </h1>
              <p style="color: #B59A62; margin: 6px 0 0 0; font-size: 13px; font-style: italic; letter-spacing: 1px;">
                The Sanctuary Registry &bull; Matriculation Petition
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #173B2D;">
                Esteemed Sanctuary Keeper,
              </p>
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #2C3E2D;">
                A new scholar has petitioned the gates of <strong>Mentis</strong> seeking matriculation into the academic sanctuary. Their application scroll awaits your review:
              </p>

              <!-- Scholar Dossier Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3EEDB; border: 1px solid #E3DAC1; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #173B2D;">
                      <tr>
                        <td width="140" style="font-weight: bold; color: #8E7541; border-bottom: 1px dashed #D6C8A7;">Scholar Name:</td>
                        <td style="font-weight: bold; border-bottom: 1px dashed #D6C8A7;">${scholar.fullName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #8E7541; border-bottom: 1px dashed #D6C8A7;">Academic Email:</td>
                        <td style="font-family: monospace; border-bottom: 1px dashed #D6C8A7;">${scholar.email}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #8E7541; border-bottom: 1px dashed #D6C8A7;">Institution:</td>
                        <td style="border-bottom: 1px dashed #D6C8A7;">${scholar.institution || 'Independent Academy'}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #8E7541; border-bottom: 1px dashed #D6C8A7;">Discipline / Program:</td>
                        <td style="border-bottom: 1px dashed #D6C8A7;">${scholar.program || 'General Scholarship'}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #8E7541; border-bottom: 1px dashed #D6C8A7;">Academic Tier:</td>
                        <td style="text-transform: capitalize; border-bottom: 1px dashed #D6C8A7;">${scholar.educationType || 'University'}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #8E7541;">Petition Timestamp:</td>
                        <td style="color: #637063;">${scholar.appliedAt || new Date().toUTCString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 12px 0 24px 0;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #173B2D; color: #FAF7EE; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; letter-spacing: 1px; border: 1px solid #B59A62;">
                      Review Petition in Registry Admin
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #637063; margin: 0; text-align: center; border-top: 1px solid #E3DAC1; padding-top: 16px;">
                Until you approve this petition, the candidate remains sheltered in the <em>Pending Review Sanctuary</em> with guarded access.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #EAE2C8; padding: 16px 32px; text-align: center; border-top: 1px solid #D6C8A7; font-size: 12px; color: #5C675C;">
              Mentis &mdash; your personal scholarly world &bull; Automated Sanctuary Courier
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: ownerEmail,
      subject: `[Mentis Registry] New Scholar Petition: ${scholar.fullName} (${scholar.institution || 'Academic Candidate'})`,
      text: `New Scholar Matriculation Petition: ${scholar.fullName} (${scholar.email}) from ${scholar.institution || 'Unknown Institution'} has applied to join Mentis. Please review at ${appUrl}`,
      html: htmlContent,
    });

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to dispatch email via Google SMTP';
    return {
      success: false,
      configured: true,
      error: errorMessage,
      details: 'Google SMTP encountered an error. Please verify that your 16-character Google App Password has no spaces or typo, and 2-Step Verification is active on your Google account.',
    };
  }
}

/**
 * Dispatches an acceptance or status update email to the candidate scholar.
 */
export async function sendScholarStatusDecisionEmail(
  toEmail: string,
  scholarName: string,
  status: 'approved' | 'rejected'
): Promise<MailerResult> {
  const transporter = createSmtpTransporter();
  const fromEmail = process.env.SMTP_FROM || `Mentis Sanctuary <${process.env.SMTP_USER || 'no-reply@mentis.academic'}>`;
  const appUrl = process.env.APP_URL || 'https://mentis.academic';

  if (!transporter) {
    return {
      success: false,
      configured: false,
      error: 'Google SMTP credentials not configured in environment variables.',
    };
  }

  const isApproved = status === 'approved';
  const subject = isApproved
    ? `Welcome to Mentis, Scholar ${scholarName} — Matriculation Approved`
    : `Mentis Matriculation Petition Update — Scholar ${scholarName}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3EEDB; font-family: 'Times New Roman', Times, Georgia, serif; color: #173B2D;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3EEDB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF7EE; border: 1px solid #D6C8A7; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background-color: #173B2D; padding: 28px; text-align: center; border-bottom: 2px solid #B59A62;">
              <h1 style="color: #FAF7EE; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: normal;">
                MENTIS
              </h1>
              <p style="color: #B59A62; margin: 6px 0 0 0; font-size: 12px; font-style: italic;">
                The Sanctuary Registry
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #173B2D; font-size: 18px; margin-top: 0;">
                Salutations, Scholar ${scholarName},
              </h2>
              ${
                isApproved
                  ? `
              <p style="font-size: 15px; line-height: 1.6; color: #2C3E2D;">
                It is our distinct privilege to inform you that your petition for matriculation into <strong>Mentis</strong> has been formally accepted and sealed by the Academy Keeper.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #2C3E2D;">
                The gates to the Daily Desk, Timetable Engine, Socratic Personas, and Manuscript Library are now open to you.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${appUrl}" style="background-color: #173B2D; color: #FAF7EE; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Enter Your Scholarly Sanctuary
                </a>
              </div>
              `
                  : `
              <p style="font-size: 15px; line-height: 1.6; color: #2C3E2D;">
                We write regarding your recent matriculation petition to <strong>Mentis</strong>. The Sanctuary Overseer has deferred your application at this time.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #5C675C;">
                If you believe this to be in error, please contact the academy administration or re-petition with updated institutional credentials.
              </p>
              `
              }
            </td>
          </tr>
          <tr>
            <td style="background-color: #EAE2C8; padding: 12px 24px; text-align: center; font-size: 11px; color: #5C675C;">
              Mentis &mdash; your personal scholarly world
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      text: isApproved
        ? `Welcome to Mentis! Your matriculation petition has been approved. Access your scholarly desk at ${appUrl}`
        : `Your matriculation petition to Mentis has been reviewed. Status: Deferred.`,
      html: htmlContent,
    });

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    return {
      success: false,
      configured: true,
      error: err instanceof Error ? err.message : 'Failed to dispatch email',
    };
  }
}
