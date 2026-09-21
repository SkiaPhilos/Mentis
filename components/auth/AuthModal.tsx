'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import { MentisGuide } from '@/components/character/MentisGuide';
import {
  Key,
  Mail,
  Lock,
  User,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Clock,
  UserCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, switchDemoAccount, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('scholar@mentis.academic');
  const [loginPassword, setLoginPassword] = useState<string>('sanctuary2026');

  // Signup form state
  const [signupFullName, setSignupFullName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupInstitution, setSignupInstitution] = useState<string>('COMSATS University');
  const [signupProgram, setSignupProgram] = useState<string>('Computer Science & Mathematics');
  const [signupEducationType, setSignupEducationType] = useState<
    'school' | 'college' | 'university' | 'graduate' | 'custom'
  >('university');
  const [signupCurrentPeriod, setSignupCurrentPeriod] = useState<string>('Semester 1');
  const [signupAvatarId, setSignupAvatarId] = useState<string>('scholar_m1');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');
    if (!loginEmail.trim()) {
      setErrorNotice('Please provide your scholarly email address.');
      return;
    }
    const result = await login(loginEmail, loginPassword);
    if (!result.success && result.error) {
      setErrorNotice(result.error);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');
    if (!signupFullName.trim() || !signupEmail.trim()) {
      setErrorNotice('Please provide your full scholarly name and academic email.');
      return;
    }

    const result = await signup({
      fullName: signupFullName,
      email: signupEmail,
      password: signupPassword,
      institution: signupInstitution,
      program: signupProgram,
      educationType: signupEducationType,
      currentPeriod: signupCurrentPeriod,
      avatarId: signupAvatarId,
    });

    if (!result.success && result.error) {
      setErrorNotice(result.error);
    } else if (onClose) {
      onClose();
    }
  };

  const avatarChoices = [
    { id: 'scholar_m1', label: 'Archivist' },
    { id: 'scholar_f1', label: 'Philosopher' },
    { id: 'scholar_m2', label: 'Astronomer' },
    { id: 'scholar_f2', label: 'Mathematician' },
    { id: 'scholar_m3', label: 'Theorist' },
    { id: 'scholar_f3', label: 'Polymath' },
    { id: 'scholar_m4', label: 'Scribe' },
    { id: 'scholar_f4', label: 'Alchemist' },
  ];

  return (
    <div
      id="mentis-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173B2D]/40 backdrop-blur-xs font-serif-scholarly animate-fade-in"
    >
      <div
        id="mentis-auth-card"
        className="w-full max-w-lg bg-[#FAF7EE] border-2 border-[#E3DAC1] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        {onClose && (
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl border border-[#E3DAC1] bg-[#F3EEDB] text-[#202820]/70 hover:text-[#173B2D] hover:border-[#B59A62] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Card Header & Seal */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3DAC1]">
          <div className="w-11 h-11 rounded-xl bg-[#173B2D] flex items-center justify-center border border-[#B59A62]/50 shadow-xs shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#B59A62" strokeWidth="1.2" />
              <path d="M7 15L12 8L17 15" stroke="#F3EEDB" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="13" r="1.5" fill="#B59A62" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#173B2D] tracking-tight">
              {mode === 'login' ? 'The Scholar’s Keyhole' : 'Matriculation to Mentis'}
            </h2>
            <p className="text-xs text-[#202820]/70 font-sans">
              {mode === 'login'
                ? 'Sign in to access your personal study desk and library'
                : 'Petition for admittance into the private scholarly sanctuary'}
            </p>
          </div>
        </div>

        {/* Quick Demo Scholar Switcher */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#F3EEDB]/80 border border-[#E3DAC1] font-sans text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#173B2D] uppercase tracking-wider font-mono">
              ◈ Quick Scholar Switch (Evaluation)
            </span>
            <span className="text-[10px] text-[#8E7541] font-mono">Instant Persona</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={() => {
                switchDemoAccount('admin');
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg bg-white/80 border border-[#E3DAC1] hover:border-[#173B2D] hover:bg-[#173B2D]/10 text-left transition-all cursor-pointer"
            >
              <div className="font-semibold text-[#173B2D] truncate">Abdullah</div>
              <div className="text-[10px] text-[#173B2D] font-mono">Admin (Approved)</div>
            </button>

            <button
              id="demo-pending-login-btn"
              type="button"
              onClick={() => {
                switchDemoAccount('pending');
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg bg-white/80 border border-[#E3DAC1] hover:border-[#8E7541] hover:bg-[#8E7541]/10 text-left transition-all cursor-pointer"
            >
              <div className="font-semibold text-[#8E7541] truncate">Hamza</div>
              <div className="text-[10px] text-[#8E7541] font-mono">Applicant (Pending)</div>
            </button>

            <button
              id="demo-rejected-login-btn"
              type="button"
              onClick={() => {
                switchDemoAccount('rejected');
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg bg-white/80 border border-[#E3DAC1] hover:border-[#B33928] hover:bg-[#B33928]/10 text-left transition-all cursor-pointer"
            >
              <div className="font-semibold text-[#B33928] truncate">Ayesha</div>
              <div className="text-[10px] text-[#B33928] font-mono">Deferred (Rejected)</div>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1]">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setErrorNotice('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-serif-scholarly font-medium transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#202820]/75 hover:text-[#173B2D]'
            }`}
          >
            Enter Sanctuary (Sign In)
          </button>
          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorNotice('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-serif-scholarly font-medium transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#202820]/75 hover:text-[#173B2D]'
            }`}
          >
            Matriculation Petition (Sign Up)
          </button>
        </div>

        {/* Error Notice */}
        {errorNotice && (
          <div
            id="auth-error-notice"
            className="mt-3 p-2.5 rounded-xl bg-[#B33928]/10 border border-[#B33928]/30 text-[#B33928] text-xs font-sans"
          >
            {errorNotice}
          </div>
        )}

        {/* Form Area with Scroll for Mobile/Small Heights */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 font-sans text-xs">
          {mode === 'login' ? (
            <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Academic Email
                </label>
                <div className="relative">
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="scholar@university.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                  <Mail className="w-4 h-4 text-[#8E7541] absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Sanctuary Password
                </label>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your key phrase"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                  <Lock className="w-4 h-4 text-[#8E7541] absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#202820]/60 hover:text-[#173B2D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-serif-scholarly font-bold text-xs shadow-md hover:bg-[#204E3C] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5 text-[#B59A62]" />
                  <span>{isLoading ? 'Verifying...' : 'Unlock Sanctuary'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form id="signup-form" onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Full Scholarly Name
                </label>
                <div className="relative">
                  <input
                    id="signup-fullname-input"
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                  <User className="w-4 h-4 text-[#8E7541] absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Academic Email
                </label>
                <div className="relative">
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="scholar@oxford.ac.uk"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                  <Mail className="w-4 h-4 text-[#8E7541] absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Sanctuary Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                  <Lock className="w-4 h-4 text-[#8E7541] absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#202820]/60 hover:text-[#173B2D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                    Institution
                  </label>
                  <input
                    id="signup-institution-input"
                    type="text"
                    value={signupInstitution}
                    onChange={(e) => setSignupInstitution(e.target.value)}
                    placeholder="COMSATS University"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  />
                </div>

                <div>
                  <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                    Academic Level
                  </label>
                  <select
                    id="signup-education-select"
                    value={signupEducationType}
                    onChange={(e) =>
                      setSignupEducationType(
                        e.target.value as 'school' | 'college' | 'university' | 'graduate' | 'custom'
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                  >
                    <option value="university">University (Semesters 1-8+)</option>
                    <option value="college">College (Years 1-2)</option>
                    <option value="school">School (Classes 1-10)</option>
                    <option value="graduate">Postgraduate / Masters</option>
                    <option value="custom">Independent Scholarly Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Program of Study
                </label>
                <input
                  id="signup-program-input"
                  type="text"
                  value={signupProgram}
                  onChange={(e) => setSignupProgram(e.target.value)}
                  placeholder="e.g. Computer Science, Physics, Philosophy"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs focus:outline-hidden focus:border-[#173B2D]"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block font-serif-scholarly font-semibold text-[#173B2D] mb-1.5">
                  Select Your Scholarly Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarChoices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSignupAvatarId(choice.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        signupAvatarId === choice.id
                          ? 'border-[#173B2D] bg-[#173B2D]/10 ring-2 ring-[#173B2D]/30 shadow-xs'
                          : 'border-[#E3DAC1] bg-white/70 hover:border-[#B59A62]'
                      }`}
                    >
                      <AvatarVisual avatarId={choice.id} size={36} interactive={false} />
                      <span className="text-[10px] text-[#173B2D] font-medium truncate w-full text-center">
                        {choice.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-signup-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-serif-scholarly font-bold text-xs shadow-md hover:bg-[#204E3C] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B59A62]" />
                  <span>{isLoading ? 'Submitting Petition...' : 'Submit Matriculation Petition'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
