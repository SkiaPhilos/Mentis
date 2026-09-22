'use client';

import React, { useState } from 'react';
import { UserProfile, ApprovalStatus } from '@/types/mentis';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import { MentisGuide } from '@/components/character/MentisGuide';
import {
  Scroll,
  Clock,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface PendingApprovalViewProps {
  user: UserProfile;
  onRefreshStatus?: () => void;
  onUpdateApprovalStatus?: (status: ApprovalStatus) => void;
  onLogout?: () => void;
  onEnterSanctuary?: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onRefreshStatus,
  onUpdateApprovalStatus,
  onLogout,
  onEnterSanctuary,
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheckedNotice, setLastCheckedNotice] = useState<string>('');

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setLastCheckedNotice(
        `Checked at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
      );
      if (onRefreshStatus) onRefreshStatus();
    }, 600);
  };

  const isRejected = user.approvalStatus === 'rejected';
  const isApproved = user.approvalStatus === 'approved';

  return (
    <div className="min-h-screen bg-[#F3EEDB] text-[#202820] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-serif-scholarly selection:bg-[#173B2D] selection:text-[#F3EEDB]">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E3DAC1]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173B2D] flex items-center justify-center border border-[#B59A62]/40 shadow-xs">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#B59A62" strokeWidth="1.2" />
              <path d="M7 15L12 8L17 15" stroke="#F3EEDB" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="13" r="1.5" fill="#B59A62" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif-scholarly font-bold text-lg tracking-tight text-[#173B2D]">
              MENTIS ACADEMIA
            </h1>
            <p className="text-[11px] text-[#202820]/60 italic font-sans -mt-0.5">
              The Registry of Scholars & Admissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              id="pending-logout-btn"
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DAC1] bg-[#FAF7EE] text-xs text-[#202820]/75 hover:text-[#173B2D] hover:border-[#B59A62] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return to Gates</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Review Parchment Card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div
          id="petition-parchment-card"
          className="rounded-3xl bg-[#FAF7EE] border-2 border-[#E3DAC1] p-6 sm:p-8 md:p-10 shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle archival watermark seal */}
          <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#173B2D" strokeWidth="2" fill="none" />
              <path d="M50 10 L50 90 M10 50 L90 50" stroke="#173B2D" strokeWidth="1" />
            </svg>
          </div>

          {/* Guide Character Inspection Header */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="p-3 rounded-2xl bg-[#F3EEDB] border border-[#E3DAC1] shadow-xs">
                <MentisGuide size={72} interactive={true} />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#173B2D] text-[#F3EEDB] border border-[#B59A62]">
                <Scroll className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium tracking-wide uppercase bg-[#8E7541]/15 text-[#8E7541] border border-[#8E7541]/30">
                {isRejected ? (
                  <>
                    <ShieldAlert className="w-3 h-3 text-[#B33928]" />
                    <span className="text-[#B33928] font-bold">Matriculation Deferred</span>
                  </>
                ) : isApproved ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#173B2D]" />
                    <span className="text-[#173B2D] font-bold">Sanctuary Granted</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-[#8E7541] animate-spin" />
                    <span>Petition Under Review</span>
                  </>
                )}
              </div>

              <h2 className="font-serif-scholarly text-xl sm:text-2xl font-bold text-[#173B2D]">
                {isRejected
                  ? 'Your Scholarly Petition Requires Revision'
                  : isApproved
                  ? 'Welcome, Scholar — The Gates Have Opened'
                  : 'Your Scholarly Petition is Under Review'}
              </h2>

              <p className="text-xs sm:text-sm text-[#202820]/75 font-sans leading-relaxed">
                {isRejected
                  ? 'The Sanctuary Keeper reviewed your petition credentials. Access has been temporarily deferred pending institutional clarification.'
                  : isApproved
                  ? 'Your credentials have been validated by the Sanctuary Overseer. You may now enter your personal scholarly desk.'
                  : 'The sanctuary keeper is verifying your academic credentials and institutional matriculation. Once sealed, your daily desk and library will awaken.'}
              </p>
            </div>
          </div>

          {/* Scholar Petition Details Ledger */}
          <div className="rounded-2xl bg-[#F3EEDB]/70 border border-[#E3DAC1] p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]/80">
              <span className="text-xs font-serif-scholarly font-bold text-[#173B2D] uppercase tracking-wider">
                Petition Record Dossier
              </span>
              <span className="text-[11px] text-[#8E7541] font-mono">
                ID: {user.id.slice(0, 16)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AvatarVisual avatarId={user.avatarId} size={42} interactive={false} />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-[#202820]/60 block uppercase font-mono">
                    Scholar Candidate
                  </span>
                  <p className="font-serif-scholarly font-bold text-[#173B2D] truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-[#202820]/70 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 sm:pt-0">
                <div className="flex items-center gap-2 text-[#202820]/80">
                  <Building2 className="w-3.5 h-3.5 text-[#B59A62] shrink-0" />
                  <span className="truncate">{user.institution || 'Academic Institution'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#202820]/80">
                  <GraduationCap className="w-3.5 h-3.5 text-[#B59A62] shrink-0" />
                  <span className="truncate">{user.program || 'Scholarly Program'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#202820]/80">
                  <FileText className="w-3.5 h-3.5 text-[#B59A62] shrink-0" />
                  <span>Standing: {user.currentPeriod || 'Semester 1'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-between">
            {isApproved ? (
              <button
                id="enter-sanctuary-btn"
                type="button"
                onClick={onEnterSanctuary}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-serif-scholarly font-bold text-sm shadow-md hover:bg-[#204E3C] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#B59A62]" />
                <span>Enter The Scholarly Desk</span>
              </button>
            ) : (
              <button
                id="check-approval-btn"
                type="button"
                disabled={isChecking}
                onClick={handleManualCheck}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-serif-scholarly font-medium text-xs shadow-xs hover:bg-[#204E3C] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#B59A62] ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Consulting Registry...' : 'Check Approval Status'}</span>
              </button>
            )}

            {lastCheckedNotice && (
              <span className="text-[11px] text-[#202820]/60 font-sans italic">
                {lastCheckedNotice}
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer Notes */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 border-t border-[#E3DAC1] text-[11px] text-[#202820]/60 font-sans">
        Mentis Sanctum • An uncompromising private academic sanctuary • Established 2026
      </footer>
    </div>
  );
};
