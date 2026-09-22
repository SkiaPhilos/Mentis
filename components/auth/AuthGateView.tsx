'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  BookOpen,
  Lock,
  Mail,
  User,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { MentisGuide } from '@/components/character/MentisGuide';
import { playClickTactile, playParchmentRustle } from '@/lib/scholarlyAudio';

export const AuthGateView: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Matriculation Petition (Signup) form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [program, setProgram] = useState('');
  const [educationType, setEducationType] = useState<
    'school' | 'college' | 'university' | 'graduate' | 'custom'
  >('university');
  const [currentPeriod, setCurrentPeriod] = useState('Semester 1');

  // Error & Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!loginEmail.trim()) {
      setErrorMessage('Please specify your academic email address.');
      return;
    }

    playClickTactile();
    const res = await login(loginEmail.trim(), loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Unable to authenticate. Please check your credentials.');
    } else {
      playParchmentRustle();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!fullName.trim() || !signupEmail.trim() || !institution.trim()) {
      setErrorMessage('Please provide your full name, academic email, and institution.');
      return;
    }

    playClickTactile();
    const res = await signup({
      fullName: fullName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      institution: institution.trim(),
      program: program.trim() || 'General Academic Studies',
      educationType,
      currentPeriod: currentPeriod.trim() || 'Semester 1',
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to submit petition scroll.');
    } else {
      playParchmentRustle();
    }
  };

  return (
    <div
      id="outside-auth-gate-root"
      className="min-h-screen bg-[#F3EEDB] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-serif-scholarly relative overflow-hidden"
    >
      {/* Subtle Background Manuscript Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-4 flex items-center justify-center">
        <BookOpen className="w-[600px] h-[600px] text-[#173B2D]" />
      </div>

      {/* Top Header / Heraldry */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between border-b border-[#E3DAC1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173B2D] flex items-center justify-center shadow-sm border border-[#B59A62]">
            <BookOpen className="w-5 h-5 text-[#FAF7EE]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#173B2D]">
              MENTIS
            </h1>
            <p className="text-[11px] sm:text-xs text-[#8E7541] italic font-sans">
              your personal scholarly world • strict sanctuary access
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7EE] border border-[#E3DAC1] text-xs text-[#173B2D]">
          <ShieldCheck className="w-4 h-4 text-[#B59A62]" />
          <span>Restricted Sanctuary Registry</span>
        </div>
      </header>

      {/* Main Gate Card */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-[#FAF7EE] rounded-3xl p-6 sm:p-9 border border-[#D6C8A7] shadow-xl space-y-6">
          {/* Guide Introduction */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#E3DAC1]">
            <div className="shrink-0">
              <MentisGuide size={50} interactive={true} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#173B2D]">
                {mode === 'login' ? 'The Scholar’s Portal' : 'Matriculation Petition'}
              </h2>
              <p className="text-xs text-[#202820]/75 font-sans leading-relaxed">
                {mode === 'login'
                  ? 'Identify yourself to access your personal study desk, library folios, and timetable.'
                  : 'Petition the registry for admittance. Applications are placed under review for approval.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1]">
            <button
              id="gate-tab-login"
              type="button"
              onClick={() => {
                playClickTactile();
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-serif-scholarly font-medium transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#173B2D] text-[#FAF7EE] shadow-sm'
                  : 'text-[#202820]/75 hover:text-[#173B2D]'
              }`}
            >
              Sign In (Existing Scholar)
            </button>
            <button
              id="gate-tab-signup"
              type="button"
              onClick={() => {
                playClickTactile();
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-serif-scholarly font-medium transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#173B2D] text-[#FAF7EE] shadow-sm'
                  : 'text-[#202820]/75 hover:text-[#173B2D]'
              }`}
            >
              Matriculation Petition (New Scholar)
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-sans animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Academic Email Address</span>
                </label>
                <input
                  id="gate-login-email-input"
                  type="email"
                  required
                  placeholder="scholar@mentis.academic or your institutional email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] focus:ring-1 focus:ring-[#173B2D] outline-none shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Sanctuary Key / Password</span>
                  </label>
                  <span className="text-[10px] text-[#8E7541] italic font-serif-scholarly">
                    (Optional if using institutional identity)
                  </span>
                </div>
                <input
                  id="gate-login-password-input"
                  type="password"
                  placeholder="Enter your security passkey"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] focus:ring-1 focus:ring-[#173B2D] outline-none shadow-xs"
                />
              </div>

              <button
                id="gate-submit-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#173B2D] text-[#FAF7EE] font-serif-scholarly font-semibold text-sm shadow-md hover:bg-[#204E3C] transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#B59A62]" />
                    <span>Enter The Sanctuary</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-[#202820]/65 font-sans">
                Admin credentials (such as{' '}
                <code className="text-[#173B2D] font-mono bg-[#EAE2C8] px-1.5 py-0.5 rounded">
                  scholar@mentis.academic
                </code>
                ) unlock the Administration Registry upon sign in.
              </div>
            </form>
          ) : (
            /* Matriculation Petition (Signup) Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Full Scholarly Name</span>
                </label>
                <input
                  id="gate-signup-name-input"
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Academic Email</span>
                  </label>
                  <input
                    id="gate-signup-email-input"
                    type="email"
                    required
                    placeholder="scholar@university.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Passkey</span>
                  </label>
                  <input
                    id="gate-signup-password-input"
                    type="password"
                    placeholder="Create a passkey"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Institution / Academy</span>
                  </label>
                  <input
                    id="gate-signup-institution-input"
                    type="text"
                    required
                    placeholder="e.g. Oxford, COMSATS, MIT"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-[#8E7541]" />
                    <span>Program / Discipline</span>
                  </label>
                  <input
                    id="gate-signup-program-input"
                    type="text"
                    placeholder="e.g. Electrical Engineering, CS"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] text-xs">
                    Academic Tier
                  </label>
                  <select
                    id="gate-signup-education-type-select"
                    value={educationType}
                    onChange={(e) =>
                      setEducationType(
                        e.target.value as
                          | 'school'
                          | 'college'
                          | 'university'
                          | 'graduate'
                          | 'custom'
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] outline-none"
                  >
                    <option value="university">University (Undergraduate)</option>
                    <option value="graduate">Graduate / Doctoral</option>
                    <option value="college">College / High School</option>
                    <option value="school">Secondary School</option>
                    <option value="custom">Independent Scholar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-serif-scholarly font-semibold text-[#173B2D] text-xs">
                    Current Standing / Term
                  </label>
                  <input
                    id="gate-signup-standing-input"
                    type="text"
                    placeholder="e.g. Semester 2, Year 1"
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] outline-none"
                  />
                </div>
              </div>

              <button
                id="gate-submit-signup-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#173B2D] text-[#FAF7EE] font-serif-scholarly font-semibold text-sm shadow-md hover:bg-[#204E3C] transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span>Dispatching Petition Scroll...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#B59A62]" />
                    <span>Submit Petition for Matriculation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#202820]/65 text-center italic font-serif-scholarly pt-1">
                New petitions are placed in the review sanctum. An email dispatch is relayed to the
                keeper.
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center pt-4 border-t border-[#E3DAC1] text-xs text-[#8E7541] font-serif-scholarly">
        Mentis &mdash; The Private Academic Sanctuary &bull; Strict Role-Based Sanctum
      </footer>
    </div>
  );
};
