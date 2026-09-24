'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { AIPersonaId, AILearningMode, ChatMessage, Course, LearningSession, Note, NoteBlock } from '@/types/mentis';
import { ActiveTab } from '@/components/layout/ScholarlyShell';
import { ScholarlyLearningIcon } from '@/components/icons/ScholarlyIcons';
import { MentisRepository } from '@/lib/storage/repository';
import { SavedSessionsModal } from './SavedSessionsModal';
import {
  Send,
  Key,
  Sparkles,
  User,
  RefreshCw,
  BookOpen,
  ShieldAlert,
  Wand2,
  CheckCircle2,
  Lock,
  Scroll,
  History,
  BookmarkPlus,
  RotateCcw,
  FileText,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { VoiceDictationButton } from '@/components/ai/VoiceDictationButton';
import {
  playParchmentRustle,
  playQuillScratch,
  playWaxSealStamp,
  playBrassBellChime,
  playClickTactile,
} from '@/lib/audio/soundEffects';

interface LearningSanctuaryViewProps {
  courses: Course[];
  onAddNote?: (note: Note) => void;
  onNavigate?: (tab: ActiveTab) => void;
}

const PERSONAS: { id: AIPersonaId; name: string; title: string; desc: string; motif: string }[] = [
  {
    id: 'raziel',
    name: 'Raziel',
    title: 'The Deep Inquirer',
    desc: 'Uncovers ontological roots and first principles through profound dialectic.',
    motif: 'Astrolabe',
  },
  {
    id: 'azazel',
    name: 'Azazel',
    title: 'The Rigorous Critic',
    desc: 'Demands absolute proof, challenges fallacies, and stress-tests assumptions.',
    motif: 'Scales',
  },
  {
    id: 'raphael',
    name: 'Raphael',
    title: 'The Empathetic Mentor',
    desc: 'Patiently decomposes complex topics into clear, pedagogical steps.',
    motif: 'Lamp',
  },
  {
    id: 'astaroth',
    name: 'Astaroth',
    title: 'The Grand Synthesizer',
    desc: 'Bridges disparate sciences, history, philosophy, and computation.',
    motif: 'Compass',
  },
  {
    id: 'jophiel',
    name: 'Jophiel',
    title: 'The Illuminator of Beauty',
    desc: 'Visualizes theorems through elegant mental models and geometric intuition.',
    motif: 'Prism',
  },
];

const MODES: { id: AILearningMode; label: string; desc: string }[] = [
  { id: 'socratic', label: 'Socratic Dialogue', desc: 'Guided inquiry through penetrating questions' },
  { id: 'teacher', label: 'Masterclass', desc: 'Comprehensive didactic lecture' },
  { id: 'practice', label: 'Practice Problems', desc: 'Challenging exercises with feedback' },
  { id: 'revision', label: 'Targeted Review', desc: 'High-yield recall of key formulas' },
  { id: 'exam', label: 'Exam Drill', desc: 'Strict examination with rubric grading' },
  { id: 'explain', label: 'Feynman Simplifier', desc: 'Vivid plain-language intuition' },
  { id: 'summary', label: 'Axiomatic Synthesis', desc: 'Concise theorem cheat-sheet' },
];

export const LearningSanctuaryView: React.FC<LearningSanctuaryViewProps> = ({
  courses,
  onAddNote,
  onNavigate,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<AIPersonaId>('raziel');
  const [selectedMode, setSelectedMode] = useState<AILearningMode>('socratic');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  // Synchronized AI Credentials from Repository
  const aiCredentials = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getAiCredentialsSnapshot,
    MentisRepository.getDefaultAiCredentials
  );

  // Synchronized Learning Sessions from Repository
  const savedSessions = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getSessionsSnapshot,
    MentisRepository.getDefaultSessions
  );

  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [inscribeNotice, setInscribeNotice] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [localKeyInput, setLocalKeyInput] = useState<string>('');
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState<boolean>(false);
  const [isKeySaving, setIsKeySaving] = useState<boolean>(false);
  const [keyFeedbackMsg, setKeyFeedbackMsg] = useState<string | null>(null);
  const [keyErrorMsg, setKeyErrorMsg] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      role: 'assistant',
      content:
        'Greetings, Scholar. I am Raziel. In what discipline shall we seek foundational clarity today? You may propose a theorem, a difficult lecture passage, or an open problem.',
      timestamp: 'Matins',
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = localKeyInput.trim();
    if (!rawVal) return;

    setKeyFeedbackMsg(null);
    setKeyErrorMsg(null);

    const isSpell = rawVal.includes('_') || (rawVal.length < 32 && rawVal.toUpperCase() === rawVal && !rawVal.startsWith('AIzaSy'));

    if (isSpell) {
      MentisRepository.saveAiCredentials({
        ...aiCredentials,
        apiKey: undefined,
        magicSpell: rawVal.toUpperCase(),
        unlockMode: 'magic_spell',
        isAwakened: true,
        lastVerifiedAt: new Date().toISOString(),
      });
      setKeyFeedbackMsg(`✨ Incantation accepted: ${rawVal.toUpperCase()} has awakened your Socratic guides.`);
      setLocalKeyInput('');
      setTimeout(() => setKeyFeedbackMsg(null), 3500);
      return;
    }

    // Encrypt API key server-side using AES-256-GCM vault
    setIsKeySaving(true);
    try {
      const res = await fetch('/api/ai/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: rawVal,
          provider: aiCredentials.provider || 'gemini',
          model: aiCredentials.modelPreference || 'gemini-3.8-flash',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        MentisRepository.saveAiCredentials({
          ...aiCredentials,
          apiKey: undefined, // Strictly never store raw key in client
          encryptedKey: data.encryptedKey,
          maskedKey: data.maskedKey,
          unlockMode: 'api_key',
          isAwakened: true,
          lastVerifiedAt: new Date().toISOString(),
        });
        playWaxSealStamp();
        playBrassBellChime();
        setKeyFeedbackMsg(`✨ Key encrypted and sealed in the vault (${data.maskedKey}). Socratic guides are awake.`);
        setLocalKeyInput('');
        setTimeout(() => setKeyFeedbackMsg(null), 3500);
      } else {
        setKeyErrorMsg(data.error || 'Failed to seal key in vault.');
      }
    } catch {
      setKeyErrorMsg('Vault connection error.');
    } finally {
      setIsKeySaving(false);
    }
  };

  const handleRevokeKey = async () => {
    setIsKeySaving(true);
    setKeyFeedbackMsg(null);
    setKeyErrorMsg(null);
    playClickTactile();
    try {
      await fetch('/api/ai/key', { method: 'DELETE' });
    } catch {
      // Best-effort remote revocation
    } finally {
      MentisRepository.saveAiCredentials({
        ...aiCredentials,
        apiKey: undefined,
        encryptedKey: undefined,
        maskedKey: undefined,
        magicSpell: '',
        unlockMode: 'none',
        isAwakened: false,
      });
      setIsKeySaving(false);
      setKeyFeedbackMsg('Credentials revoked and vault purged. AI tutors returned to dormant stasis.');
      setLocalKeyInput('');
      setTimeout(() => setKeyFeedbackMsg(null), 3500);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    playParchmentRustle();
    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const activeCourse = courses.find((c) => c.id === selectedCourseId);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          persona: selectedPersona,
          mode: selectedMode,
          topic: activeCourse ? activeCourse.name : userText,
          encryptedKey: aiCredentials.encryptedKey || undefined,
          magicSpell: aiCredentials.magicSpell || undefined,
          model: aiCredentials.modelPreference || 'gemini-3.8-flash',
          useSearchGrounding,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playQuillScratch();
        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          role: 'assistant',
          content: data.response || 'The sanctuary echoes with thoughtful silence.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          searchSources: data.searchSources,
          searchQueries: data.searchQueries,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_err_${Date.now()}`,
            role: 'assistant',
            content: `The sanctuary was momentarily perturbed: ${errData.message || errData.error || 'Check server connection or API key.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  const handleSaveCurrentSession = () => {
    if (messages.length <= 1) return;
    playParchmentRustle();
    const firstUserMsg = messages.find((m) => m.role === 'user')?.content || '';
    const sessionTitle = firstUserMsg
      ? firstUserMsg.slice(0, 48) + (firstUserMsg.length > 48 ? '...' : '')
      : `Dialectic with ${activePersonaObj.name}`;

    const newSession: LearningSession = {
      id: `session_${Date.now()}`,
      userId: 'user_1',
      courseId: selectedCourseId || undefined,
      title: sessionTitle,
      persona: selectedPersona,
      mode: selectedMode,
      topic: sessionTitle,
      messages: [...messages],
      savedAt: new Date().toISOString(),
    };

    MentisRepository.addSession(newSession);
    setSaveNotice('Dialogue thread preserved in Socratic Archive.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleInscribeCurrentToNote = () => {
    if (messages.length <= 1) return;
    playQuillScratch();

    const activeCourse = courses.find((c) => c.id === selectedCourseId);
    const firstUserMsg = messages.find((m) => m.role === 'user')?.content || '';
    const noteTitle = firstUserMsg
      ? `Dialectic: ${firstUserMsg.slice(0, 40)}...`
      : `Inquiry with ${activePersonaObj.name} on ${activeCourse?.code || 'Discipline'}`;

    const noteBlocks: NoteBlock[] = [
      {
        id: `b_hdr_${Date.now()}`,
        type: 'heading',
        content: `Socratic Dialogue: ${activePersonaObj.name} (${activePersonaObj.title})`,
      },
      {
        id: `b_meta_${Date.now()}`,
        type: 'quote',
        content: `Discipline: ${activeCourse ? `${activeCourse.code} - ${activeCourse.name}` : 'General Inquiry'} • Mode: ${selectedMode} • Inscribed on ${new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}`,
      },
      ...messages.map((m, idx) => ({
        id: `b_msg_${idx}_${Date.now()}`,
        type: m.role === 'user' ? ('paragraph' as const) : ('quote' as const),
        content: m.role === 'user' ? `**Scholar:** ${m.content}` : `**${activePersonaObj.name}:** ${m.content}`,
      })),
    ];

    const newNote: Note = {
      id: `note_${Date.now()}`,
      userId: 'user_1',
      courseId: selectedCourseId || undefined,
      title: noteTitle,
      blocks: noteBlocks,
      tags: ['dialectic', activePersonaObj.name.toLowerCase(), selectedMode],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MentisRepository.addNote(newNote);
    if (onAddNote) onAddNote(newNote);

    setInscribeNotice('Manuscript note inscribed from your Socratic dialogue.');
    setTimeout(() => setInscribeNotice(null), 4500);
  };

  const handleInscribeSavedSessionToNote = (session: LearningSession) => {
    playQuillScratch();
    const course = courses.find((c) => c.id === session.courseId);
    const personaObj = PERSONAS.find((p) => p.id === session.persona) || activePersonaObj;

    const noteBlocks: NoteBlock[] = [
      {
        id: `b_hdr_${Date.now()}`,
        type: 'heading',
        content: `Archived Dialectic: ${personaObj.name} (${personaObj.title})`,
      },
      {
        id: `b_meta_${Date.now()}`,
        type: 'quote',
        content: `Discipline: ${course ? `${course.code} - ${course.name}` : 'General Inquiry'} • Mode: ${session.mode} • Inscribed on ${new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}`,
      },
      ...session.messages.map((m, idx) => ({
        id: `b_msg_${idx}_${Date.now()}`,
        type: m.role === 'user' ? ('paragraph' as const) : ('quote' as const),
        content: m.role === 'user' ? `**Scholar:** ${m.content}` : `**${personaObj.name}:** ${m.content}`,
      })),
    ];

    const newNote: Note = {
      id: `note_${Date.now()}`,
      userId: 'user_1',
      courseId: session.courseId,
      title: session.title || `Inquiry with ${personaObj.name}`,
      blocks: noteBlocks,
      tags: ['dialectic', personaObj.name.toLowerCase(), session.mode, 'archive'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MentisRepository.addNote(newNote);
    if (onAddNote) onAddNote(newNote);

    setInscribeNotice(`Preserved session "${session.title}" inscribed to Manuscripts.`);
    setTimeout(() => setInscribeNotice(null), 4500);
  };

  const handleResumeSession = (session: LearningSession) => {
    setSelectedPersona(session.persona);
    setSelectedMode(session.mode);
    if (session.courseId) setSelectedCourseId(session.courseId);
    setMessages(session.messages);
    playParchmentRustle();
  };

  const handleResetConversation = () => {
    playParchmentRustle();
    setMessages([
      {
        id: `m_welcome_${Date.now()}`,
        role: 'assistant',
        content: `Greetings, Scholar. I am ${activePersonaObj.name}. In what discipline shall we seek foundational clarity today?`,
        timestamp: 'Matins',
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            The AI Learning Sanctuary
          </h2>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            5 specialized scholarly personas conducting 7 pedagogical modes of inquiry.
          </p>
        </div>

        <button
          id="sanctuary-key-drawer-toggle"
          onClick={() => setIsKeyDrawerOpen(!isKeyDrawerOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-serif-scholarly transition-colors self-start sm:self-auto cursor-pointer ${
            aiCredentials.isAwakened
              ? 'bg-[#173B2D]/10 border-[#173B2D]/30 text-[#173B2D]'
              : 'bg-[#FAF7EE] border-[#E3DAC1] hover:border-[#B59A62] text-[#8E7541]'
          }`}
        >
          {aiCredentials.isAwakened ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#173B2D]" />
              <span>Tutors Awakened ({aiCredentials.unlockMode === 'magic_spell' ? 'Spell' : 'Key'})</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Awaken Tutors (Key / Arcana)</span>
            </>
          )}
        </button>
      </div>

      {/* Magical Key Configuration Drawer */}
      {isKeyDrawerOpen && (
        <form
          id="sanctuary-quick-key-form"
          onSubmit={handleSaveKey}
          className="parchment-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#B59A62] space-y-3"
        >
          <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B59A62]" />
              <h3 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
                The Scholarly Arcana Quick Key & Incantation
              </h3>
            </div>
            <span className="text-[11px] text-[#202820]/60 font-mono">
              {aiCredentials.isAwakened ? 'Status: Active' : 'Status: Dormant'}
            </span>
          </div>

          <p className="text-xs text-[#202820]/80 font-sans">
            Enter your Google AI Studio key (<code className="font-mono text-[#173B2D]">AIzaSy...</code>) or inscribe an Academy Spell (<code className="font-mono text-[#173B2D]">MENTIS_ACADEMIA_2026</code>) to awaken interactive Socratic dialogues. Keys are encrypted server-side with AES-256-GCM and never stored unencrypted.
          </p>

          {/* Current Vault Status */}
          {aiCredentials.isAwakened && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#173B2D]" />
                <span className="text-xs font-mono text-[#173B2D] font-semibold">
                  {aiCredentials.maskedKey
                    ? `Vault Key: ${aiCredentials.maskedKey}`
                    : `Spell: ${aiCredentials.magicSpell}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#173B2D]/10 text-[#173B2D] font-medium">
                  {aiCredentials.maskedKey ? 'AES-256-GCM Sealed' : 'Academic Arcana'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRevokeKey}
                disabled={isKeySaving}
                className="text-[11px] font-serif-scholarly text-red-800 hover:text-red-900 underline cursor-pointer"
              >
                Revoke & Purge Vault
              </button>
            </div>
          )}

          {keyFeedbackMsg && (
            <div className="p-2.5 rounded-xl bg-[#173B2D]/10 border border-[#173B2D]/30 text-[#173B2D] text-xs font-serif-scholarly">
              {keyFeedbackMsg}
            </div>
          )}

          {keyErrorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-serif-scholarly">
              {keyErrorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="sanctuary-quick-key-input"
              type="password"
              value={localKeyInput}
              onChange={(e) => setLocalKeyInput(e.target.value)}
              placeholder={
                aiCredentials.maskedKey
                  ? `Active key (${aiCredentials.maskedKey}) — enter new key to replace`
                  : aiCredentials.magicSpell
                  ? `Active spell (${aiCredentials.magicSpell}) — enter new key/spell to replace`
                  : 'Paste Gemini Key (AIzaSy...) or Spell (MENTIS_ACADEMIA_2026)...'
              }
              className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAF7EE] border border-[#E3DAC1] rounded-xl text-[#202820]"
            />
            <button
              id="sanctuary-save-quick-key-btn"
              type="submit"
              disabled={isKeySaving}
              className="px-4 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium shrink-0 hover:bg-[#122E23] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isKeySaving ? 'Sealing...' : 'Awaken & Seal'}
            </button>
          </div>
        </form>
      )}

      {/* Persona Selection Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PERSONAS.map((p) => {
          const isSelected = p.id === selectedPersona;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#FAF7EE] border-[#B59A62] shadow-sm ring-2 ring-[#B59A62]/40 scale-[1.02]'
                  : 'bg-[#FAF7EE]/60 border-[#E3DAC1] hover:bg-[#FAF7EE]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-serif-scholarly text-[#8E7541] font-semibold uppercase">
                  {p.motif}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#173B2D]" />
                )}
              </div>
              <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] mt-1">
                {p.name}
              </h4>
              <p className="text-[11px] text-[#202820]/65 mt-0.5 leading-snug line-clamp-2">
                {p.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Learning Mode Selection Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-serif-scholarly scrollbar-none">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            title={m.desc}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              selectedMode === m.id
                ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                : 'bg-[#FAF7EE] text-[#202820]/70 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Active Dialogue Chamber */}
      <div className="parchment-card rounded-2xl p-5 sm:p-6 flex flex-col h-[520px] shadow-sm">
        {/* Active Session Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E3DAC1] mb-4 text-xs font-serif-scholarly">
          <div className="flex items-center gap-2">
            <ScholarlyLearningIcon size={18} active />
            <span className="font-bold text-[#173B2D]">{activePersonaObj.name}</span>
            <span className="text-[#202820]/40">·</span>
            <span className="text-[#8E7541] capitalize">{selectedMode} Mode</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8E7541]" />
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-transparent border border-[#E3DAC1] rounded-lg px-2 py-0.5 text-xs text-[#173B2D]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[#E3DAC1] mx-0.5 hidden sm:block" />

            {/* Search Grounding Toggle Button */}
            <button
              type="button"
              onClick={() => {
                playClickTactile();
                setUseSearchGrounding(!useSearchGrounding);
              }}
              title={
                useSearchGrounding
                  ? 'Google Search Grounding Active (gemini-3.5-flash with live sources)'
                  : 'Enable Google Search Grounding for live citations'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-serif-scholarly transition-all cursor-pointer ${
                useSearchGrounding
                  ? 'bg-[#173B2D] text-[#F3EEDB] border-[#B59A62] shadow-xs'
                  : 'bg-[#FAF7EE] text-[#202820]/60 border-[#E3DAC1] hover:text-[#173B2D]'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-[#D4AF37]' : 'text-[#8E7541]'}`} />
              <span className="hidden sm:inline">Search Grounding</span>
            </button>

            {/* Inscribe to Note Button */}
            <button
              onClick={handleInscribeCurrentToNote}
              disabled={messages.length <= 1}
              title="Inscribe this dialogue into a Manuscript note"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#B59A62]/60 bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#8E7541] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#B59A62]" />
              <span className="hidden md:inline">Inscribe Note</span>
            </button>

            {/* Save Session Button */}
            <button
              onClick={handleSaveCurrentSession}
              disabled={messages.length <= 1}
              title="Archive current Socratic session"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E3DAC1] bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#173B2D] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#8E7541]" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Archived Sessions Modal Button */}
            <button
              onClick={() => {
                playClickTactile();
                setIsSessionsModalOpen(true);
              }}
              title="View archived Socratic discussions"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E3DAC1] bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#173B2D] transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#8E7541]" />
              <span>Archive ({savedSessions.length})</span>
            </button>

            {/* Fresh Vigil Reset Button */}
            <button
              onClick={handleResetConversation}
              title="Begin a fresh dialogue vigil"
              className="p-1 rounded-lg text-[#202820]/60 hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inscribe or Save Feedback Banner */}
        {(inscribeNotice || saveNotice) && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#B59A62] flex items-center justify-between text-xs font-serif-scholarly text-[#173B2D] animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>{inscribeNotice || saveNotice}</span>
            </div>
            {inscribeNotice && onNavigate && (
              <button
                onClick={() => onNavigate('notes')}
                className="flex items-center gap-1 text-[11px] text-[#8E7541] hover:underline font-bold cursor-pointer"
              >
                <span>Open in Manuscripts</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isAsst = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAsst ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-serif-scholarly font-bold shadow-xs ${
                    isAsst
                      ? 'bg-[#173B2D] text-[#B59A62] border border-[#B59A62]/40'
                      : 'bg-[#B59A62] text-[#173B2D]'
                  }`}
                >
                  {isAsst ? activePersonaObj.name[0] : <User className="w-4 h-4 text-[#173B2D]" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAsst
                      ? 'bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] font-serif-scholarly'
                      : 'bg-[#173B2D] text-[#F3EEDB] font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounded Google Search Sources */}
                  {isAsst && msg.searchSources && msg.searchSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E3DAC1] text-[11px] font-sans">
                      <div className="text-[10px] font-serif-scholarly font-bold text-[#8E7541] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#8E7541]" />
                        <span>Grounded Scholarly Sources ({msg.searchSources.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.searchSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAE2C8]/70 hover:bg-[#E2D6B5] text-[#173B2D] border border-[#E3DAC1] text-[10px] truncate max-w-xs transition-colors cursor-pointer"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 opacity-50 ${
                      isAsst ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-serif-scholarly text-[#8E7541] animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>{activePersonaObj.name} is formulating dialectical synthesis...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-[#E3DAC1] flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Inquire with ${activePersonaObj.name} (${selectedMode} mode)...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#202820] focus:border-[#B59A62] outline-hidden shadow-inner"
          />
          <VoiceDictationButton
            onTranscription={(transcribedText) => {
              playQuillScratch();
              setInputMessage((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
            }}
            tooltip="Dictate your inquiry into the Socratic Sanctuary"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] disabled:opacity-50 text-xs font-serif-scholarly font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#B59A62]" />
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        </form>
      </div>

      <SavedSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        sessions={savedSessions}
        courses={courses}
        onResumeSession={handleResumeSession}
        onInscribeSessionToNote={handleInscribeSavedSessionToNote}
      />
    </div>
  );
};
