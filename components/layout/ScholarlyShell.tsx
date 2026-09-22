'use client';

import React from 'react';
import {
  ScholarlyDeskIcon,
  ScholarlyScheduleIcon,
  ScholarlyNotesIcon,
  ScholarlyLibraryIcon,
  ScholarlyLearningIcon,
  ScholarlyProfileIcon,
} from '@/components/icons/ScholarlyIcons';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import { MentisGuide } from '@/components/character/MentisGuide';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { UserProfile } from '@/types/mentis';
import { ShieldCheck, LogIn, KeyRound, LogOut } from 'lucide-react';
import { AmbianceController } from '@/components/audio/AmbianceController';
import { playParchmentRustle, playClickTactile } from '@/lib/audio/soundEffects';

export type ActiveTab = 'desk' | 'schedule' | 'notes' | 'library' | 'learning' | 'profile' | 'admin';

interface ScholarlyShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const ScholarlyShell: React.FC<ScholarlyShellProps> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenAuth,
  onLogout,
  children,
}) => {
  const navItems = [
    { id: 'desk' as ActiveTab, label: 'Daily Desk', icon: ScholarlyDeskIcon },
    { id: 'schedule' as ActiveTab, label: 'Timetable', icon: ScholarlyScheduleIcon },
    { id: 'notes' as ActiveTab, label: 'Manuscripts', icon: ScholarlyNotesIcon },
    { id: 'library' as ActiveTab, label: 'Library', icon: ScholarlyLibraryIcon },
    { id: 'learning' as ActiveTab, label: 'Sanctuary AI', icon: ScholarlyLearningIcon },
    { id: 'profile' as ActiveTab, label: 'Scholar Profile', icon: ScholarlyProfileIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F3EEDB] text-[#202820] flex flex-col md:flex-row">
      {/* Desktop Scholarly Sidebar */}
      <aside
        id="mentis-desktop-sidebar"
        className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-[#FAF7EE] border-r border-[#E3DAC1] p-5 shrink-0 min-h-screen sticky top-0"
      >
        {/* Brand Header & Seal */}
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-[#E3DAC1]">
            <div className="w-10 h-10 rounded-xl bg-[#173B2D] flex items-center justify-center shadow-xs border border-[#B59A62]/40 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#B59A62" strokeWidth="1.2" />
                <path d="M7 15L12 8L17 15" stroke="#F3EEDB" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="13" r="1.5" fill="#B59A62" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif-scholarly text-xl font-bold tracking-tight text-[#173B2D]">
                MENTIS
              </h1>
              <p className="text-[11px] text-[#202820]/60 italic font-serif-scholarly -mt-0.5">
                Your personal scholarly world
              </p>
            </div>
          </div>

          {/* Active Scholar Card with Floating Name */}
          <div
            onClick={() => onSelectTab('profile')}
            className="mt-5 p-3 rounded-2xl bg-[#F3EEDB]/60 border border-[#E3DAC1] hover:border-[#B59A62]/50 cursor-pointer transition-all flex items-center gap-3"
          >
            <AvatarVisual
              avatarId={profile.avatarId}
              size={48}
              userName={profile.fullName}
              showFloatingName={false}
              interactive={false}
            />
            <div className="overflow-hidden">
              <p className="font-serif-scholarly font-bold text-sm text-[#173B2D] truncate">
                {profile.fullName}
              </p>
              <p className="text-xs text-[#202820]/65 truncate">
                {profile.institution}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#A9C9A9]/30 text-[#173B2D] font-medium truncate">
                  {profile.currentPeriod}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono uppercase font-bold ${
                    profile.approvalStatus === 'approved'
                      ? 'bg-[#173B2D]/10 text-[#173B2D]'
                      : profile.approvalStatus === 'pending'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {profile.approvalStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    playParchmentRustle();
                    onSelectTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-serif-scholarly text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#173B2D] text-[#F3EEDB] font-semibold shadow-xs'
                      : 'text-[#202820]/80 hover:bg-[#EAE2C8]/70 hover:text-[#173B2D]'
                  }`}
                >
                  <Icon
                    size={20}
                    active={isActive}
                    className={isActive ? 'text-[#B59A62]' : 'text-[#173B2D]'}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Management Option */}
            {profile.role === 'admin' && (
              <button
                id="nav-admin"
                onClick={() => {
                  playParchmentRustle();
                  onSelectTab('admin');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-serif-scholarly text-sm transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#173B2D] text-[#F3EEDB] font-semibold shadow-xs'
                    : 'text-[#202820]/80 hover:bg-[#EAE2C8]/70 hover:text-[#173B2D]'
                }`}
              >
                <ShieldCheck
                  size={20}
                  className={activeTab === 'admin' ? 'text-[#B59A62]' : 'text-[#8E7541]'}
                />
                <span>Administration</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: Scholarly Ambiance, The Mentis Guide & PWA Install */}
        <div className="pt-4 border-t border-[#E3DAC1] space-y-3">
          <div className="w-full">
            <AmbianceController />
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-btn"
              type="button"
              onClick={() => {
                playClickTactile();
                onLogout();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-rose-400 hover:bg-rose-50/50 text-xs font-serif-scholarly text-[#202820] hover:text-rose-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5 text-rose-700" />
                <span>Log Out of Sanctum</span>
              </span>
              <span className="text-[10px] text-rose-800 font-sans">Exit</span>
            </button>
          )}

          <PWAInstallButton compact />

          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F3EEDB]/40 border border-[#E3DAC1]/80">
            <MentisGuide size={42} interactive={true} />
            <div className="text-[11px] text-[#202820]/75 font-serif-scholarly leading-tight">
              <span className="font-semibold text-[#173B2D] block">Mentis Guide</span>
              <span>At your service, Scholar</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Desktop Top Sub-Header */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3 bg-[#FAF7EE]/70 border-b border-[#E3DAC1]/60">
          <div className="flex items-center gap-2 text-xs font-serif-scholarly text-[#8E7541]">
            <span className="font-semibold text-[#173B2D]">Mentis Academia</span>
            <span>•</span>
            <span>{profile.institution || 'Sanctuary of Scholarly Thought'}</span>
            <span className="text-[#B59A62]">({profile.role === 'admin' ? 'Administrator' : 'Scholar'})</span>
          </div>
          <div className="flex items-center gap-3">
            <AmbianceController />
            {onLogout && (
              <button
                id="desktop-logout-btn"
                type="button"
                onClick={() => {
                  playClickTactile();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-rose-400 hover:bg-rose-50/60 text-xs font-serif-scholarly text-[#202820] hover:text-rose-900 transition-colors cursor-pointer"
                title="Log out of sanctuary"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-700" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Top Header */}
        <header
          id="mentis-mobile-header"
          className="md:hidden flex items-center justify-between p-3.5 bg-[#FAF7EE] border-b border-[#E3DAC1] sticky top-0 z-30 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#173B2D] flex items-center justify-center text-[#B59A62] font-serif-scholarly font-bold text-sm">
              M
            </div>
            <div>
              <span className="font-serif-scholarly font-bold text-sm text-[#173B2D] block leading-none">
                MENTIS
              </span>
              <span className="text-[10px] text-[#202820]/60 italic font-serif-scholarly">
                scholarly world
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AmbianceController compact />
            {onLogout && (
              <button
                id="mobile-logout-btn"
                type="button"
                onClick={() => {
                  playClickTactile();
                  onLogout();
                }}
                className="p-1.5 rounded-lg border border-[#E3DAC1] text-rose-700 hover:bg-rose-50 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <PWAInstallButton compact />
            <div
              onClick={() => {
                playParchmentRustle();
                onSelectTab('profile');
              }}
              className="cursor-pointer"
            >
              <AvatarVisual avatarId={profile.avatarId} size={34} interactive={false} />
            </div>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mentis-mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7EE] border-t border-[#E3DAC1] px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playParchmentRustle();
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-[#173B2D]' : 'text-[#202820]/60'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-all ${
                  isActive ? 'bg-[#A9C9A9]/35 scale-110' : ''
                }`}
              >
                <Icon size={20} active={isActive} />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-serif-scholarly leading-none ${
                  isActive ? 'font-bold text-[#173B2D]' : ''
                }`}
              >
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
