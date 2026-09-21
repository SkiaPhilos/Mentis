import { NextRequest, NextResponse } from 'next/server';
import {
  sendScholarRegistrationNotification,
  isSmtpConfigured,
  ScholarNotificationData,
} from '@/lib/email/mailer';

export async function GET() {
  const configured = isSmtpConfigured();
  const ownerEmail = process.env.OWNER_EMAIL || 'abdullahsaeed.sam@gmail.com';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || '465';

  return NextResponse.json({
    configured,
    provider: 'Google SMTP',
    host,
    port,
    ownerEmail,
    instructions: configured
      ? 'Google SMTP credentials are armed. Registration petitions will notify the owner.'
      : 'Google SMTP is awaiting credentials (SMTP_USER and 16-character Google App Password in environment).',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { success: false, error: 'Missing scholar name or academic email address.' },
        { status: 400 }
      );
    }

    const scholarData: ScholarNotificationData = {
      id: body.id || `sch_${Date.now()}`,
      fullName: String(body.fullName).trim(),
      email: String(body.email).trim(),
      institution: String(body.institution || 'Academic Institution').trim(),
      program: String(body.program || 'Scholarly Pursuits').trim(),
      educationType: body.educationType || 'university',
      appliedAt: new Date().toUTCString(),
    };

    const result = await sendScholarRegistrationNotification(scholarData);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal notification delivery failure';
    return NextResponse.json(
      {
        success: false,
        configured: isSmtpConfigured(),
        error: message,
      },
      { status: 500 }
    );
  }
}
