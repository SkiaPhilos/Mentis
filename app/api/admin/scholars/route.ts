import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  isSmtpConfigured,
  sendScholarRegistrationNotification,
  sendScholarStatusDecisionEmail,
} from '@/lib/email/mailer';

export async function GET(req: NextRequest) {
  const adminClient = createAdminClient();
  const smtpActive = isSmtpConfigured();
  const ownerEmail = process.env.OWNER_EMAIL || 'abdullahsaeed.sam@gmail.com';
  const adminEmails = (process.env.ADMIN_EMAILS || ownerEmail)
    .split(',')
    .map((e) => e.trim().toLowerCase());

  // Check if Supabase has stored profiles
  if (adminClient) {
    try {
      const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && profiles) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          scholars: profiles,
          smtpConfigured: smtpActive,
          ownerEmail,
        });
      }
    } catch {
      // Fall through to repository metadata
    }
  }

  return NextResponse.json({
    success: true,
    source: 'repository',
    smtpConfigured: smtpActive,
    ownerEmail,
    adminEmails,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'update_status';
    const ownerEmail = process.env.OWNER_EMAIL || 'abdullahsaeed.sam@gmail.com';

    // 1. Action: Test Notification (Sends a verification email to the owner via Google SMTP)
    if (action === 'test_notification') {
      const testResult = await sendScholarRegistrationNotification({
        id: `test_ping_${Date.now()}`,
        fullName: 'Test Scholar Candidate',
        email: 'applicant.test@mentis.academic',
        institution: 'Academy of Classical Philosophy',
        program: 'Epistemology & Dialectics',
        educationType: 'graduate',
        appliedAt: new Date().toUTCString(),
      });

      return NextResponse.json({
        success: testResult.success,
        configured: testResult.configured,
        messageId: testResult.messageId,
        error: testResult.error,
        details: testResult.details,
        recipient: ownerEmail,
      });
    }

    // 2. Action: Update Scholar Status
    const { scholarId, scholarEmail, scholarName, status } = body;

    if (!scholarId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing scholarId or status parameters.' },
        { status: 400 }
      );
    }

    let databaseUpdated = false;
    const adminClient = createAdminClient();

    if (adminClient) {
      try {
        const { error } = await adminClient
          .from('profiles')
          .update({
            approval_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scholarId);

        if (!error) {
          databaseUpdated = true;
        }
      } catch {
        // Fall back to client repository sync
      }
    }

    // Dispatch decision notification to applicant if an email is provided and SMTP is armed
    let emailDispatched = false;
    let emailResult = null;

    if (scholarEmail && (status === 'approved' || status === 'rejected')) {
      emailResult = await sendScholarStatusDecisionEmail(
        scholarEmail,
        scholarName || 'Scholar',
        status
      );
      emailDispatched = emailResult.success;
    }

    return NextResponse.json({
      success: true,
      scholarId,
      status,
      databaseUpdated,
      emailDispatched,
      emailResult,
      smtpConfigured: isSmtpConfigured(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Admin action execution error',
      },
      { status: 500 }
    );
  }
}
