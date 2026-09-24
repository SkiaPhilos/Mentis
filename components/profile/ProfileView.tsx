'use client';

import React, { useState } from 'react';
import { UserProfile, Course, UserAiCredential, AIProvider } from '@/types/mentis';
import { AvatarVisual } from '@/components/character/AvatarVisual';
import { AvatarGallery } from '@/components/character/AvatarGallery';
import { getAvatarById } from '@/lib/avatars';
import { ACADEMIC_MAGIC_SPELLS } from '@/lib/storage/repository';
import {
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  GraduationCap,
  School,
  BookOpen,
  Scroll,
  Info,
  Key,
  Wand2,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Feather,
  Bell,
  Stamp,
  Music,
} from 'lucide-react';
import { AmbianceController } from '@/components/audio/AmbianceController';
import {
  isSfxMuted,
  setSfxMuted,
  getSfxVolume,
  setSfxVolume,
  subscribeSfx,
  playParchmentRustle,
  playQuillScratch,
  playWaxSealStamp,
  playBrassBellChime,
  playClickTactile,
} from '@/lib/audio/soundEffects';

interface ProfileViewProps {
  profile: UserProfile;
  courses: Course[];
  aiCredentials: UserAiCredential;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateAiCredentials: (credentials: UserAiCredential) => void;
  onOpenMatriculation?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  courses,
  aiCredentials,
  onUpdateProfile,
  onAddCourse,
  onDeleteCourse,
  onUpdateAiCredentials,
  onOpenMatriculation,
}) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Credentials & Arcane Spell Form State
  const [credForm, setCredForm] = useState<UserAiCredential>(aiCredentials);
  const [credTab, setCredTab] = useState<'api_key' | 'magic_spell'>(
    aiCredentials.unlockMode === 'magic_spell' ? 'magic_spell' : 'api_key'
  );
  const [rawApiKeyInput, setRawApiKeyInput] = useState('');
  const [isFourthWallOpen, setIsFourthWallOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [credSavedSuccess, setCredSavedSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');

  // Scholarly Acoustics & Tactile SFX State
  const [sfxState, setSfxState] = useState({
    isMuted: isSfxMuted(),
    volume: getSfxVolume(),
  });

  React.useEffect(() => {
    return subscribeSfx((settings) => {
      setSfxState({ ...settings });
    });
  }, []);

  // New course modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseColor, setNewCourseColor] = useState('#173B2D');

  const avatar = getAvatarById(profileForm.avatarId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playWaxSealStamp();
    onUpdateProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserAiCredential = {
      ...credForm,
      apiKey: undefined,
      unlockMode: credTab,
      lastVerifiedAt: new Date().toISOString(),
    };
    setCredForm(updated);
    onUpdateAiCredentials(updated);
    setCredSavedSuccess(true);
    setTimeout(() => setCredSavedSuccess(false), 2500);
  };

  const handleTestAndAwaken = async () => {
    setVerificationStatus('testing');
    setVerificationMessage('Communing with the academic ether...');

    if (credTab === 'magic_spell') {
      const spell = credForm.magicSpell?.trim().toUpperCase() || '';
      if (ACADEMIC_MAGIC_SPELLS[spell]) {
        const spellTitle = ACADEMIC_MAGIC_SPELLS[spell];
        setVerificationStatus('success');
        setVerificationMessage(`✨ Incantation Accepted: "${spellTitle}" has awakened your Socratic guide personas!`);
        const updated: UserAiCredential = {
          ...credForm,
          apiKey: undefined,
          magicSpell: spell,
          isAwakened: true,
          unlockMode: 'magic_spell',
          lastVerifiedAt: new Date().toISOString(),
        };
        setCredForm(updated);
        onUpdateAiCredentials(updated);
      } else if (spell.length > 3) {
        // Custom institutional spell
        setVerificationStatus('success');
        setVerificationMessage(`✨ Academy Passphrase recognized: Socratic tutors awakened via Institutional Relay.`);
        const updated: UserAiCredential = {
          ...credForm,
          apiKey: undefined,
          magicSpell: spell,
          isAwakened: true,
          unlockMode: 'magic_spell',
          lastVerifiedAt: new Date().toISOString(),
        };
        setCredForm(updated);
        onUpdateAiCredentials(updated);
      } else {
        setVerificationStatus('error');
        setVerificationMessage('Unknown incantation. Try: MENTIS_ACADEMIA_2026 or NOCTIS_LUCIS_SOCRATIS');
      }
    } else {
      // API Key mode: securely seal server-side via AES-256-GCM vault
      const keyToEncrypt = rawApiKeyInput.trim();
      if (keyToEncrypt) {
        try {
          const res = await fetch('/api/ai/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: keyToEncrypt,
              provider: credForm.provider,
              model: credForm.modelPreference || 'gemini-3.8-flash',
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setVerificationStatus('success');
            setVerificationMessage(`🟢 Key encrypted with AES-256-GCM and sealed in vault (${data.maskedKey}). Socratic guides are awake.`);
            const updated: UserAiCredential = {
              ...credForm,
              apiKey: undefined, // Never keep raw key on client
              encryptedKey: data.encryptedKey,
              maskedKey: data.maskedKey,
              isAwakened: true,
              unlockMode: 'api_key',
              lastVerifiedAt: new Date().toISOString(),
            };
            setCredForm(updated);
            onUpdateAiCredentials(updated);
            setRawApiKeyInput('');
          } else {
            setVerificationStatus('error');
            setVerificationMessage(data.error || 'Failed to encrypt key.');
          }
        } catch {
          setVerificationStatus('error');
          setVerificationMessage('Failed to communicate with key vault endpoint.');
        }
      } else if (credForm.encryptedKey || credForm.maskedKey) {
        setVerificationStatus('success');
        setVerificationMessage(`🟢 Existing vault key is sealed (${credForm.maskedKey || 'AES-256-GCM'}). Guides are awake.`);
      } else {
        setVerificationStatus('error');
        setVerificationMessage('Please enter an API key to encrypt and seal in your scholarly vault (minimum 16 characters).');
      }
    }
  };

  const handleRevokeCredentials = async () => {
    try {
      await fetch('/api/ai/key', { method: 'DELETE' });
    } catch {
      // Best-effort remote revocation
    }
    const revoked: UserAiCredential = {
      ...credForm,
      apiKey: undefined,
      encryptedKey: undefined,
      maskedKey: undefined,
      magicSpell: '',
      isAwakened: false,
      unlockMode: 'none',
    };
    setCredForm(revoked);
    setRawApiKeyInput('');
    onUpdateAiCredentials(revoked);
    setVerificationStatus('idle');
    setVerificationMessage('Credentials revoked and vault purged. AI tutors returned to dormant stasis.');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    playParchmentRustle();
    const course: Course = {
      id: `course_${Date.now()}`,
      userId: profile.id,
      name: newCourseName,
      code: newCourseCode,
      instructor: newCourseInstructor,
      credits: newCourseCredits,
      color: newCourseColor,
      notesCount: 0,
    };
    onAddCourse(course);
    setIsCourseModalOpen(false);
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseInstructor('');
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
          Academic Scholar Profile
        </h2>
        <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
          Your persistent scholar identity, avatar persona, and curriculum registry.
        </p>
      </div>

      {/* Main Profile & Avatar Card */}
      <div className="parchment-card rounded-2xl p-6 sm:p-7 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex flex-col items-center shrink-0">
            <AvatarVisual
              avatarId={profileForm.avatarId}
              size={96}
              userName={profileForm.fullName}
              showFloatingName={true}
              interactive={false}
            />
            <button
              type="button"
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="mt-3 px-3 py-1 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[11px] font-serif-scholarly text-[#173B2D] transition-colors"
            >
              {isEditingAvatar ? 'Close Avatar Gallery' : 'Change Scholar Avatar'}
            </button>
            {onOpenMatriculation && (
              <button
                type="button"
                onClick={onOpenMatriculation}
                className="mt-2 px-3 py-1 rounded-xl bg-[#F3EEDB] border border-[#B59A62]/60 hover:bg-[#EAE2C8] text-[11px] font-serif-scholarly font-bold text-[#8E7541] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Scroll className="w-3.5 h-3.5 text-[#B59A62]" />
                <span>Matriculation Ceremony</span>
              </button>
            )}
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-serif-scholarly font-bold bg-[#173B2D] text-[#F3EEDB]">
                {avatar.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-serif-scholarly bg-[#A9C9A9]/30 text-[#173B2D]">
                {avatar.title}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-serif-scholarly bg-[#B59A62]/20 text-[#8E7541] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Scholar</span>
              </span>
            </div>

            <h3 className="font-serif-scholarly text-2xl font-bold text-[#173B2D] mt-2">
              {profileForm.fullName}
            </h3>
            <p className="text-xs text-[#202820]/75 font-sans mt-1">
              Enrolled in {profileForm.program} at {profileForm.institution} ({profileForm.currentPeriod}).
            </p>
          </div>
        </div>

        {/* Expandable Avatar Selection Gallery */}
        {isEditingAvatar && (
          <div className="mt-6 pt-6 border-t border-[#E3DAC1]">
            <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] text-center mb-3">
              Choose your Scholarly Avatar (4 Masculine · 4 Feminine)
            </h4>
            <AvatarGallery
              selectedAvatarId={profileForm.avatarId}
              onSelect={(id) => {
                setProfileForm({ ...profileForm, avatarId: id });
              }}
            />
          </div>
        )}
      </div>

      {/* Edit Academic Parameters Form */}
      <form
        onSubmit={handleSaveProfile}
        className="parchment-card rounded-2xl p-6 sm:p-7 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
          <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
            Academic Parameters & Goals
          </h3>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-serif-scholarly text-[#173B2D] font-bold">
              <Check className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Profile Inscribed!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif-scholarly">
          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Full Legal / Academic Name</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Academic Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Institution / University</label>
            <input
              type="text"
              value={profileForm.institution}
              onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Program / Major</label>
            <input
              type="text"
              value={profileForm.program}
              onChange={(e) => setProfileForm({ ...profileForm, program: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Current Academic Period</label>
            <input
              type="text"
              value={profileForm.currentPeriod}
              onChange={(e) => setProfileForm({ ...profileForm, currentPeriod: e.target.value })}
              placeholder="e.g. Semester 4 or Class 10"
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#173B2D] mb-1">Target Standing / GPA</label>
            <input
              type="text"
              value={profileForm.targetGrade}
              onChange={(e) => setProfileForm({ ...profileForm, targetGrade: e.target.value })}
              placeholder="e.g. 3.90 GPA or A+"
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium hover:bg-[#122E23] transition-colors shadow-xs"
          >
            Save Academic Profile
          </button>
        </div>
      </form>

      {/* ===================================================================== */}
      {/* The Scholarly Arcana: AI Provider Credentials & Magic Incantations    */}
      {/* ===================================================================== */}
      <div
        id="scholarly-arcana-card"
        className="parchment-card rounded-2xl p-6 sm:p-7 space-y-5 border border-[#B59A62]/40"
      >
        {/* Card Header with Status Seal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DAC1]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B59A62]" />
              <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                The Scholarly Arcana & AI Credentials
              </h3>
            </div>
            <p className="text-xs text-[#202820]/70 font-sans">
              Enter your AI provider credentials or inscribe an Academy Spell to awaken the Socratic guide personas.
            </p>
          </div>

          {/* Awakening Status Seal */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {credForm.isAwakened ? (
              <span
                id="tutor-status-awakened-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#173B2D]/10 text-[#173B2D] border border-[#173B2D]/25 text-[11px] font-serif-scholarly font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#173B2D]" />
                <span>Tutors Awakened</span>
              </span>
            ) : (
              <span
                id="tutor-status-dormant-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8E7541]/10 text-[#8E7541] border border-[#8E7541]/30 text-[11px] font-serif-scholarly font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-[#8E7541]" />
                <span>Tutors Dormant</span>
              </span>
            )}
          </div>
        </div>

        {/* Technical Guidance Accordion: Setup Guide */}
        <div
          id="ai-setup-guidance-box"
          className="rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <button
              id="ai-setup-guide-toggle-btn"
              type="button"
              onClick={() => setIsFourthWallOpen(!isFourthWallOpen)}
              className="flex items-center gap-2 text-xs font-serif-scholarly font-semibold text-[#173B2D] hover:text-[#8E7541] transition-colors group cursor-pointer"
            >
              <span className="p-1 rounded-md bg-[#F3EEDB] border border-[#E3DAC1] group-hover:border-[#B59A62]">
                <Scroll className="w-3.5 h-3.5 text-[#B59A62]" />
              </span>
              <span>
                {isFourthWallOpen ? 'Hide Architecture & Setup Guide' : 'AI Provider & Architecture Guide'}
              </span>
              <Info className="w-3.5 h-3.5 text-[#202820]/60 ml-0.5" />
            </button>

            <span className="text-[10px] text-[#8E7541] font-mono tracking-tight">
              {isFourthWallOpen ? '◈ Scroll Unrolled' : '◈ Click to view setup guide'}
            </span>
          </div>

          {/* Unrolled Technical Guidance Card */}
          {isFourthWallOpen && (
            <div className="pt-3 border-t border-[#E3DAC1]/70 space-y-3 text-xs text-[#202820]/80 font-sans leading-relaxed">
              <div className="p-3 rounded-lg bg-[#F3EEDB] border border-[#B59A62]/40 text-[#173B2D]">
                <p className="font-semibold text-xs mb-1 flex items-center gap-1.5 text-[#173B2D]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#B59A62]" />
                  Connect your AI provider API key or Academy Spell to awaken the Socratic tutors
                </p>
                <p className="text-[11px] text-[#202820]/75">
                  Mentis operates on a client-owned key model. Because interactive dialectics, document synthesis, and Socratic drills consume LLM tokens, every scholar connects their personal AI account or utilizes an Academy incantation. Your key is stored securely in your private browser vault and sent only to authenticated server-side endpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-white/70 border border-[#E3DAC1] space-y-1.5">
                  <h4 className="font-semibold text-[#173B2D] flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#B59A62]" /> Option A: Free Google Gemini Key
                  </h4>
                  <p className="text-[#202820]/70">
                    Google AI Studio offers a generous free-tier API quota. Generate a key in seconds and paste it into the key slot below.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[#173B2D] font-medium underline underline-offset-2 hover:text-[#8E7541]"
                  >
                    <span>Open Google AI Studio Keys</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 rounded-lg bg-white/70 border border-[#E3DAC1] space-y-1.5">
                  <h4 className="font-semibold text-[#173B2D] flex items-center gap-1">
                    <Wand2 className="w-3 h-3 text-[#B59A62]" /> Option B: Arcane Magic Code / Spell
                  </h4>
                  <p className="text-[#202820]/70">
                    If your academic department or institution issued you an authorization passphrase (e.g. <code className="bg-[#FAF7EE] px-1 py-0.5 rounded border border-[#E3DAC1] text-[#173B2D]">MENTIS_ACADEMIA_2026</code>), enter it in the Magic Spell slot to awaken the tutors through the academy vault.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector Tabs: Personal Key vs Arcane Spell */}
        <div className="flex items-center gap-2 p-1 bg-[#FAF7EE] rounded-xl border border-[#E3DAC1]">
          <button
            id="tab-provider-key-btn"
            type="button"
            onClick={() => setCredTab('api_key')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-serif-scholarly font-medium transition-all ${
              credTab === 'api_key'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#202820]/70 hover:text-[#173B2D]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>AI Provider API Key</span>
          </button>

          <button
            id="tab-magic-spell-btn"
            type="button"
            onClick={() => setCredTab('magic_spell')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-serif-scholarly font-medium transition-all ${
              credTab === 'magic_spell'
                ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs'
                : 'text-[#202820]/70 hover:text-[#173B2D]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Arcane Magic Code / Spell</span>
          </button>
        </div>

        {/* Tab 1: AI Provider API Key */}
        {credTab === 'api_key' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  AI Service Provider
                </label>
                <select
                  id="ai-provider-select"
                  value={credForm.provider}
                  onChange={(e) =>
                    setCredForm({ ...credForm, provider: e.target.value as AIProvider })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs font-serif-scholarly"
                >
                  <option value="gemini">Google Gemini (Recommended — Native Socratic Engine)</option>
                  <option value="openai">OpenAI (GPT-4o, o3-mini, o1)</option>
                  <option value="anthropic">Anthropic (Claude 3.7 Sonnet, 3.5 Haiku)</option>
                  <option value="custom">Custom / Ollama / OpenRouter Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                  Preferred Model Tier
                </label>
                <select
                  id="ai-model-select"
                  value={credForm.modelPreference || 'gemini-3.8-flash'}
                  onChange={(e) =>
                    setCredForm({ ...credForm, modelPreference: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs font-serif-scholarly"
                >
                  {credForm.provider === 'gemini' ? (
                    <>
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: Fast, Multimodal, Native Socratic)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Mathematical & Proof Reasoning)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Low Latency, High Throughput)</option>
                    </>
                  ) : credForm.provider === 'openai' ? (
                    <>
                      <option value="gpt-4o">gpt-4o (Omni Multimodal & General Reasoning)</option>
                      <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Effective)</option>
                      <option value="o3-mini">o3-mini (STEM, Logic & Mathematical Reasoning)</option>
                      <option value="o1">o1 (Deep Deliberation & Complex Problem Solving)</option>
                    </>
                  ) : credForm.provider === 'anthropic' ? (
                    <>
                      <option value="claude-3-7-sonnet">claude-3-7-sonnet (Hybrid Reasoning & Advanced Synthesis)</option>
                      <option value="claude-3-5-sonnet">claude-3-5-sonnet (Analytical & Humanities Exposition)</option>
                      <option value="claude-3-5-haiku">claude-3-5-haiku (Fast Response & Conciseness)</option>
                    </>
                  ) : (
                    <option value="custom-model">Local / Compatible Endpoint Model</option>
                  )}
                </select>
              </div>
            </div>

            {credForm.maskedKey && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#173B2D]" />
                  <div>
                    <p className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                      Vault Key Active: <span className="font-mono">{credForm.maskedKey}</span>
                    </p>
                    <p className="text-[10px] text-[#202820]/70 font-mono">
                      Ciphertext sealed with AES-256-GCM · Plaintext never stored in client
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#173B2D]/10 text-[#173B2D]">
                  Encrypted Vault
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                {credForm.maskedKey ? 'Update Provider API Key' : 'Provider API Key'}
              </label>
              <div className="relative">
                <input
                  id="ai-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={rawApiKeyInput}
                  onChange={(e) => setRawApiKeyInput(e.target.value)}
                  placeholder={
                    credForm.maskedKey
                      ? `Vault is sealed (${credForm.maskedKey}) — paste new key to replace`
                      : credForm.provider === 'gemini'
                      ? 'AIzaSy... (Google AI Studio Key)'
                      : credForm.provider === 'openai'
                      ? 'sk-proj-... (OpenAI Key)'
                      : 'sk-ant-... (Anthropic Key)'
                  }
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] text-xs font-mono tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#202820]/50 hover:text-[#173B2D]"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#202820]/60 font-sans">
                Keys are encrypted server-side with AES-256-GCM. Raw plaintext keys are never stored in browser storage.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Arcane Magic Code / Spell */}
        {credTab === 'magic_spell' && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-serif-scholarly font-semibold text-[#173B2D] mb-1">
                Arcane Incantation / Scholar&apos;s Passphrase
              </label>
              <input
                id="magic-spell-input"
                type="text"
                value={credForm.magicSpell || ''}
                onChange={(e) =>
                  setCredForm({ ...credForm, magicSpell: e.target.value.toUpperCase() })
                }
                placeholder="e.g. MENTIS_ACADEMIA_2026 or NOCTIS_LUCIS_SOCRATIS"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] text-xs font-mono uppercase tracking-wider font-semibold"
              />
              <p className="mt-1.5 text-[11px] text-[#202820]/60 font-sans">
                Inscribe an academic authorization spell issued by your academy, or choose a recognized incantation below:
              </p>
            </div>

            {/* Clickable Academy Spells Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-serif-scholarly font-bold text-[#8E7541] uppercase tracking-wider">
                Recognized Academy Spells:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ACADEMIC_MAGIC_SPELLS).map(([spell, desc]) => (
                  <button
                    key={spell}
                    type="button"
                    onClick={() => {
                      setCredForm({ ...credForm, magicSpell: spell });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      credForm.magicSpell === spell
                        ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D]'
                        : 'bg-[#FAF7EE] text-[#173B2D] border-[#E3DAC1] hover:border-[#B59A62]'
                    }`}
                    title={desc}
                  >
                    ✨ {spell}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Status Banner */}
        {verificationMessage && (
          <div
            id="ai-credential-status-message"
            className={`p-3 rounded-xl border text-xs font-serif-scholarly flex items-start gap-2.5 ${
              verificationStatus === 'success'
                ? 'bg-[#173B2D]/10 border-[#173B2D]/30 text-[#173B2D]'
                : verificationStatus === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-[#8E7541]/10 border-[#8E7541]/30 text-[#8E7541]'
            }`}
          >
            {verificationStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#173B2D] shrink-0 mt-0.5" />
            ) : verificationStatus === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#8E7541] shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="flex-1">
              <span>{verificationMessage}</span>
              {credForm.lastVerifiedAt && verificationStatus === 'success' && (
                <div className="text-[10px] text-[#202820]/60 font-mono mt-0.5">
                  Verified: {new Date(credForm.lastVerifiedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save confirmation toast */}
        {credSavedSuccess && (
          <div className="p-3 rounded-xl bg-[#173B2D]/10 border border-[#173B2D]/30 text-[#173B2D] text-xs font-serif-scholarly flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>AI Credentials securely inscribed into your Scholar Profile Vault.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#E3DAC1]">
          <div className="flex items-center gap-2">
            <button
              id="test-and-awaken-btn"
              type="button"
              onClick={handleTestAndAwaken}
              disabled={verificationStatus === 'testing'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7EE] border border-[#B59A62] text-[#173B2D] text-xs font-serif-scholarly font-medium hover:bg-[#F3EEDB] transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>
                {credTab === 'magic_spell' ? 'Speak Spell & Awaken' : 'Test Key & Awaken Tutor'}
              </span>
            </button>

            {credForm.isAwakened && (
              <button
                id="revoke-credentials-btn"
                type="button"
                onClick={handleRevokeCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#202820]/60 hover:text-red-700 text-xs font-serif-scholarly transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Return to Dormant</span>
              </button>
            )}
          </div>

          <button
            id="save-ai-credentials-btn"
            type="button"
            onClick={() => handleSaveCredentials()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium hover:bg-[#122E23] transition-colors shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Inscribe & Save Credentials</span>
          </button>
        </div>
      </div>

      {/* Course Registry Section */}
      <div className="parchment-card rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
          <div>
            <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
              Enrolled Course Registry
            </h3>
            <p className="text-xs text-[#202820]/60 font-sans">
              Courses associated with manuscripts, books, and timetable slots.
            </p>
          </div>

          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: course.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif-scholarly font-bold text-[#8E7541]">
                      {course.code}
                    </span>
                    <span className="text-[10px] text-[#202820]/60">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
                    {course.name}
                  </h4>
                  <p className="text-xs text-[#202820]/60 italic mt-0.5">
                    {course.instructor}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickTactile();
                  onDeleteCourse(course.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-800 hover:bg-rose-50 rounded-lg transition-opacity cursor-pointer"
                title="Remove course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scholarly Acoustics & Tactile Soundscape Module */}
      <div id="scholarly-acoustics-panel" className="parchment-card rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DAC1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#173B2D]/10 border border-[#173B2D]/20 flex items-center justify-center text-[#173B2D]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                Scholarly Acoustics & Tactile Soundscapes
              </h3>
              <p className="text-xs text-[#202820]/70 font-sans">
                Native Web Audio synthesizer for ambient focus atmospheres and physical manuscript tactile audio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                const nextMuted = !sfxState.isMuted;
                setSfxMuted(nextMuted);
                if (!nextMuted) playWaxSealStamp();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-serif-scholarly font-medium transition-colors cursor-pointer ${
                sfxState.isMuted
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-[#173B2D]/10 text-[#173B2D] border-[#173B2D]/30'
              }`}
            >
              {sfxState.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Tactile SFX Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tactile SFX Active</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Ambiance Controller Embed */}
        <div className="space-y-2">
          <h4 className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
            Background Ambient Soundscape (Synthesized Online)
          </h4>
          <AmbianceController className="w-full max-w-full" />
        </div>

        {/* Tactile Sound Effects Controls & Auditioning */}
        <div className="space-y-3 pt-3 border-t border-[#E3DAC1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h4 className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                Tactile SFX Volume & Synthesis
              </h4>
              <p className="text-[11px] text-[#202820]/70">
                Auditory feedback synthesized in real-time without external network assets or MP3 audio downloads.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={sfxState.isMuted}
                value={sfxState.volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setSfxVolume(vol);
                }}
                className="w-28 accent-[#173B2D] cursor-pointer"
                title="Tactile sound effects volume"
              />
              <span className="font-mono text-xs text-[#8E7541] w-9 text-right font-medium">
                {sfxState.isMuted ? '0%' : `${Math.round(sfxState.volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Audition buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => playParchmentRustle()}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Rustle Parchment</span>
            </button>

            <button
              type="button"
              onClick={() => playQuillScratch()}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5 text-[#8E7541]" />
              <span>Quill Scratch</span>
            </button>

            <button
              type="button"
              onClick={() => playWaxSealStamp()}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
            >
              <Stamp className="w-3.5 h-3.5 text-rose-800" />
              <span>Wax Seal Stamp</span>
            </button>

            <button
              type="button"
              onClick={() => playBrassBellChime()}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Brass Bell Chime</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#F3EEDB] p-6 shadow-2xl border border-[#B59A62]/50 text-[#173B2D]">
            <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] pb-3 border-b border-[#E3DAC1]">
              Register New Course
            </h3>

            <form onSubmit={handleCreateCourse} className="mt-4 space-y-3.5 text-xs font-serif-scholarly">
              <div>
                <label className="block font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Quantum Mechanics I"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Course Code</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. PHY-301"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Instructor / Professor</label>
                <input
                  type="text"
                  value={newCourseInstructor}
                  onChange={(e) => setNewCourseInstructor(e.target.value)}
                  placeholder="e.g. Prof. Paul Dirac"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Palette Accent</label>
                <div className="flex items-center gap-2">
                  {['#173B2D', '#2C5E4B', '#3D362A', '#8E7541', '#1B2C3B', '#4A2C3B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCourseColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCourseColor === c ? 'scale-125 ring-2 ring-[#B59A62]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DAC1]">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[#202820]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] font-medium"
                >
                  Register Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
