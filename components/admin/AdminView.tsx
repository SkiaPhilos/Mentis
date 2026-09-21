'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { UserProfile, ApprovalStatus } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  RotateCcw,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: UserProfile;
}

interface SmtpStatus {
  smtpConfigured: boolean;
  ownerEmail: string;
  smtpHost?: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const scholars = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getScholarsSnapshot,
    MentisRepository.getDefaultScholars
  );

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus>({
    smtpConfigured: false,
    ownerEmail: 'abdullahsaeed.sam@gmail.com',
    smtpHost: 'smtp.gmail.com',
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState<boolean>(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Fetch server-side SMTP configuration status
  useEffect(() => {
    fetch('/api/admin/scholars')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.smtpConfigured === 'boolean') {
          setSmtpStatus({
            smtpConfigured: data.smtpConfigured,
            ownerEmail: data.ownerEmail || 'abdullahsaeed.sam@gmail.com',
            smtpHost: data.smtpHost || 'smtp.gmail.com',
          });
        }
      })
      .catch(() => {
        // Fallback defaults
      });
  }, []);

  const handleTestSmtpNotification = async () => {
    setIsTestingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await fetch('/api/admin/scholars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_notification' }),
      });
      const data = await res.json();

      if (data.success) {
        setSmtpFeedback({
          type: 'success',
          message: `✨ Test petition successfully dispatched via Google SMTP to ${smtpStatus.ownerEmail}!`,
        });
      } else if (!data.configured) {
        setSmtpFeedback({
          type: 'info',
          message: `Google SMTP is awaiting credentials: Set SMTP_USER (your Gmail) and SMTP_PASS (16-char App Password) in your environment variables.`,
        });
      } else {
        setSmtpFeedback({
          type: 'error',
          message: data.error || 'SMTP delivery failed. Check your 16-character App Password.',
        });
      }
    } catch {
      setSmtpFeedback({
        type: 'error',
        message: 'Could not communicate with the SMTP relay.',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ApprovalStatus) => {
    const scholar = scholars.find((s) => s.id === id);
    MentisRepository.updateScholarStatus(id, newStatus);

    // Call server to persist in Supabase and dispatch email decision notification
    fetch('/api/admin/scholars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        scholarId: id,
        scholarEmail: scholar?.email,
        scholarName: scholar?.fullName,
        status: newStatus,
      }),
    }).catch(() => {});
  };

  const filtered = scholars.filter((s) => filter === 'all' || s.status === filter);
  const pendingCount = scholars.filter((s) => s.status === 'pending').length;

  return (
    <div id="admin-view-root" className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#8E7541]" />
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            Academic Registry Administration
          </h2>
        </div>
        <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
          Review pending scholar access petitions, matriculations, and manage institutional credentials.
        </p>
      </div>

      {/* Google SMTP Notification Status Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E3DAC1] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173B2D]/10 flex items-center justify-center text-[#173B2D] shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-[#8E7541]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-scholarly font-bold text-sm text-[#173B2D]">
                  Google SMTP Courier & Owner Notification
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    smtpStatus.smtpConfigured
                      ? 'bg-[#A9C9A9]/40 text-[#173B2D]'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {smtpStatus.smtpConfigured ? 'Armed & Ready' : 'Awaiting Google App Password'}
                </span>
              </div>
              <p className="text-xs text-[#202820]/70 mt-0.5">
                New candidate registrations automatically dispatch a matriculation petition to{' '}
                <strong className="text-[#173B2D] font-mono">{smtpStatus.ownerEmail}</strong>.
              </p>
            </div>
          </div>

          <button
            id="test-smtp-dispatch-btn"
            type="button"
            onClick={handleTestSmtpNotification}
            disabled={isTestingSmtp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#173B2D] text-[#FAF7EE] hover:bg-[#122E23] text-xs font-serif-scholarly transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>{isTestingSmtp ? 'Dispatching...' : 'Test Owner Courier'}</span>
          </button>
        </div>

        {smtpFeedback && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
              smtpFeedback.type === 'success'
                ? 'bg-[#A9C9A9]/30 text-[#173B2D] border border-[#173B2D]/20'
                : smtpFeedback.type === 'info'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {smtpFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#173B2D] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">
              <span>{smtpFeedback.message}</span>
              {!smtpStatus.smtpConfigured && (
                <div className="mt-1 text-[11px] text-[#202820]/75">
                  Generate a 16-character password at{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#173B2D] font-semibold"
                  >
                    Google Account &gt; App Passwords
                  </a>{' '}
                  and specify <code className="bg-[#EAE2C8] px-1 py-0.5 rounded">SMTP_USER</code> &amp;{' '}
                  <code className="bg-[#EAE2C8] px-1 py-0.5 rounded">SMTP_PASS</code> in your environment.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-serif-scholarly">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            id={`filter-${f}-btn`}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
              filter === f
                ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                : 'bg-[#FAF7EE] text-[#202820]/70 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
            }`}
          >
            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Scholar List */}
      <div className="parchment-card rounded-2xl p-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#202820]/60 font-sans italic">
            No scholars currently found under the &quot;{filter}&quot; classification.
          </div>
        ) : (
          filtered.map((scholar) => (
            <div
              key={scholar.id}
              id={`scholar-row-${scholar.id}`}
              className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#B59A62]/60"
            >
              <div className="flex items-center gap-3.5">
                <AvatarVisual avatarId={scholar.avatarId} size={48} interactive={false} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif-scholarly font-bold text-sm text-[#173B2D]">
                      {scholar.fullName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-serif-scholarly uppercase font-bold ${
                        scholar.status === 'approved'
                          ? 'bg-[#A9C9A9]/30 text-[#173B2D] border border-[#173B2D]/20'
                          : scholar.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {scholar.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#202820]/70 mt-0.5 font-sans">
                    {scholar.program} · {scholar.institution}
                  </p>
                  <p className="text-[11px] text-[#202820]/50 font-mono mt-0.5">
                    {scholar.email} · Applied {scholar.appliedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {scholar.status === 'pending' && (
                  <>
                    <button
                      id={`approve-btn-${scholar.id}`}
                      type="button"
                      onClick={() => handleUpdateStatus(scholar.id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#B59A62]" />
                      <span>Approve Scholar</span>
                    </button>
                    <button
                      id={`reject-btn-${scholar.id}`}
                      type="button"
                      onClick={() => handleUpdateStatus(scholar.id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7EE] border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-serif-scholarly cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {scholar.status === 'approved' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif-scholarly text-[#173B2D] flex items-center gap-1">
                      <CheckIcon className="w-4 h-4 text-[#173B2D]" />
                      <span>Access Granted</span>
                    </span>
                    <button
                      id={`revoke-btn-${scholar.id}`}
                      type="button"
                      onClick={() => handleUpdateStatus(scholar.id, 'rejected')}
                      title="Revoke scholar access"
                      className="p-1.5 rounded-lg border border-[#E3DAC1] text-[#202820]/60 hover:text-[#B33928] hover:border-[#B33928] cursor-pointer text-xs"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {scholar.status === 'rejected' && (
                  <button
                    id={`reconsider-btn-${scholar.id}`}
                    type="button"
                    onClick={() => handleUpdateStatus(scholar.id, 'pending')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3DAC1] text-xs text-[#202820]/75 hover:text-[#173B2D] hover:border-[#B59A62] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Reopen Petition</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
