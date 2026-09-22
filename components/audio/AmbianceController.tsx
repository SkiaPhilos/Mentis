'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Music,
  Flame,
  Clock,
  Moon,
  Sparkles,
  Timer,
  X,
  Check,
  Feather,
  Scroll,
  Bell,
  Stamp,
} from 'lucide-react';
import {
  scholarlyAmbientEngine,
  SCHOLARLY_SOUNDSCAPES,
  SoundscapeId,
  AmbientState,
} from '@/lib/audio/ambientPlayer';
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

interface AmbianceControllerProps {
  compact?: boolean;
  className?: string;
}

export const AmbianceController: React.FC<AmbianceControllerProps> = ({
  compact = false,
  className = '',
}) => {
  const [ambientState, setAmbientState] = useState<AmbientState>(() =>
    scholarlyAmbientEngine.getState()
  );
  const [sfxState, setSfxState] = useState({
    isMuted: isSfxMuted(),
    volume: getSfxVolume(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubAmbient = scholarlyAmbientEngine.subscribe((state) => {
      setAmbientState({ ...state });
    });
    const unsubSfx = subscribeSfx((sfx) => {
      setSfxState({ ...sfx });
    });

    return () => {
      unsubAmbient();
      unsubSfx();
    };
  }, []);

  const activeSoundscape =
    SCHOLARLY_SOUNDSCAPES.find((s) => s.id === ambientState.currentSoundscape) ||
    SCHOLARLY_SOUNDSCAPES[0];

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    playClickTactile();
    scholarlyAmbientEngine.toggle();
  };

  const handleSelectSoundscape = (id: SoundscapeId) => {
    playParchmentRustle();
    scholarlyAmbientEngine.setSoundscape(id);
    if (!ambientState.isPlaying) {
      scholarlyAmbientEngine.play();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    scholarlyAmbientEngine.setVolume(newVol);
  };

  const handleSleepTimerChange = (mins: number) => {
    playClickTactile();
    scholarlyAmbientEngine.setSleepTimer(mins);
  };

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSoundscapeIcon = (id: SoundscapeId, size = 18) => {
    switch (id) {
      case 'cloister-rain':
        return <CloudRain size={size} />;
      case 'scriptorium-lute':
        return <Music size={size} />;
      case 'fireplace-hearth':
        return <Flame size={size} />;
      case 'library-clock':
        return <Clock size={size} />;
      case 'nocturnal-archive':
        return <Moon size={size} />;
    }
  };

  return (
    <>
      {/* Trigger Pill / Button */}
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          id="scholarly-ambiance-trigger"
          onClick={() => {
            playClickTactile();
            setIsModalOpen(true);
          }}
          className={`flex items-center gap-2 rounded-xl border transition-all cursor-pointer ${
            ambientState.isPlaying
              ? 'bg-[#173B2D] text-[#F3EEDB] border-[#B59A62]/60 shadow-xs'
              : 'bg-[#FAF7EE] text-[#173B2D] border-[#E3DAC1] hover:border-[#B59A62]'
          } ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs font-serif-scholarly'}`}
          title="Scholarly Ambiance & Soundscapes"
        >
          {/* Waveform / Icon */}
          <div className="flex items-center gap-1">
            {ambientState.isPlaying ? (
              <div className="flex items-center gap-0.5 h-3.5 px-0.5">
                <span className="w-0.5 bg-[#B59A62] animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-[#B59A62] animate-[pulse_0.8s_ease-in-out_infinite] h-3.5" />
                <span className="w-0.5 bg-[#B59A62] animate-[pulse_0.5s_ease-in-out_infinite] h-1.5" />
                <span className="w-0.5 bg-[#B59A62] animate-[pulse_0.9s_ease-in-out_infinite] h-3" />
              </div>
            ) : (
              <Music className="w-3.5 h-3.5 text-[#8E7541]" />
            )}
          </div>

          <span className="truncate max-w-[110px] sm:max-w-[140px]">
            {ambientState.isPlaying ? activeSoundscape.name : 'Ambiance'}
          </span>

          {/* Quick Play/Pause Mini Toggle */}
          <span
            onClick={handleTogglePlay}
            className="p-1 rounded-lg hover:bg-black/10 transition-colors ml-0.5"
            title={ambientState.isPlaying ? 'Pause soundscape' : 'Play soundscape'}
          >
            {ambientState.isPlaying ? (
              <Pause className="w-3 h-3 text-[#B59A62]" />
            ) : (
              <Play className="w-3 h-3 text-[#8E7541]" />
            )}
          </span>

          {/* Sleep timer remaining badge */}
          {ambientState.sleepTimerRemainingSeconds > 0 && ambientState.isPlaying && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#B59A62]/20 text-[#B59A62] font-semibold">
              {formatSeconds(ambientState.sleepTimerRemainingSeconds)}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Ambiance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            id="ambiance-modal"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F3EEDB] p-6 sm:p-7 shadow-2xl border border-[#B59A62]/60 text-[#173B2D] space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#173B2D] text-[#B59A62] flex items-center justify-center shadow-xs">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-scholarly text-xl font-bold text-[#173B2D]">
                    Scholarly Ambiance Sanctum
                  </h3>
                  <p className="text-xs text-[#8E7541] italic font-serif-scholarly">
                    Aura et Harmonia Scholastica — Continuous Acoustic Atmosphere
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickTactile();
                  setIsModalOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-[#EAE2C8] text-[#202820]/70 hover:text-[#173B2D] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Master Playback & Volume Deck */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7EE] border border-[#E3DAC1] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  id="ambiance-master-play-btn"
                  onClick={() => handleTogglePlay()}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    ambientState.isPlaying
                      ? 'bg-rose-800 hover:bg-rose-900 text-white'
                      : 'bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB]'
                  }`}
                  title={ambientState.isPlaying ? 'Pause soundscape' : 'Awaken soundscape'}
                >
                  {ambientState.isPlaying ? (
                    <Pause className="w-6 h-6 text-[#B59A62]" />
                  ) : (
                    <Play className="w-6 h-6 text-[#B59A62] ml-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif-scholarly font-bold text-base text-[#173B2D]">
                      {activeSoundscape.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                        ambientState.isPlaying
                          ? 'bg-[#173B2D]/10 text-[#173B2D]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ambientState.isPlaying ? 'Resonating' : 'Resting'}
                    </span>
                  </div>
                  <p className="text-xs text-[#202820]/60 italic font-serif-scholarly">
                    {activeSoundscape.archetype}
                  </p>
                </div>
              </div>

              {/* Master Volume Slider */}
              <div className="flex items-center gap-3 w-full sm:w-56">
                <button
                  type="button"
                  onClick={() => handleVolumeChange(ambientState.volume > 0 ? 0 : 0.5)}
                  className="p-1.5 rounded-lg text-[#8E7541] hover:bg-[#EAE2C8] cursor-pointer"
                  title={ambientState.volume > 0 ? 'Mute ambiance' : 'Unmute ambiance'}
                >
                  {ambientState.volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-800" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#202820]/70">
                    <span>Volume</span>
                    <span>{Math.round(ambientState.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={ambientState.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-[#173B2D] cursor-pointer h-1.5 bg-[#E3DAC1] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Soundscapes Grid */}
            <div className="space-y-2">
              <h4 className="font-serif-scholarly font-bold text-xs uppercase tracking-wider text-[#8E7541]">
                Select Scholarly Atmosphere
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCHOLARLY_SOUNDSCAPES.map((soundscape) => {
                  const isCurrent = ambientState.currentSoundscape === soundscape.id;
                  return (
                    <button
                      key={soundscape.id}
                      type="button"
                      onClick={() => handleSelectSoundscape(soundscape.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#FAF7EE] border-[#B59A62] ring-2 ring-[#B59A62]/30 shadow-xs'
                          : 'bg-[#FAF7EE]/60 border-[#E3DAC1] hover:bg-[#FAF7EE] hover:border-[#B59A62]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? 'bg-[#173B2D] text-[#B59A62]'
                                : 'bg-[#EAE2C8] text-[#173B2D] group-hover:bg-[#173B2D] group-hover:text-[#B59A62]'
                            } transition-colors`}
                          >
                            {getSoundscapeIcon(soundscape.id)}
                          </div>
                          <div>
                            <span className="font-serif-scholarly font-bold text-sm text-[#173B2D] block">
                              {soundscape.name}
                            </span>
                            <span className="text-[10px] text-[#8E7541] italic font-serif-scholarly">
                              {soundscape.latinName}
                            </span>
                          </div>
                        </div>

                        {isCurrent && ambientState.isPlaying && (
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-1 bg-[#173B2D] animate-[pulse_0.7s_infinite] h-2" />
                            <span className="w-1 bg-[#173B2D] animate-[pulse_0.5s_infinite] h-3" />
                            <span className="w-1 bg-[#173B2D] animate-[pulse_0.9s_infinite] h-1.5" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#202820]/70 font-sans mt-2.5 leading-relaxed">
                        {soundscape.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep Timer Bar */}
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[#8E7541]" />
                  <span className="font-serif-scholarly font-bold text-xs text-[#173B2D]">
                    Academic Sleep Timer
                  </span>
                </div>
                {ambientState.sleepTimerRemainingSeconds > 0 && (
                  <span className="text-xs font-mono font-bold text-[#8E7541]">
                    Remaining: {formatSeconds(ambientState.sleepTimerRemainingSeconds)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[0, 15, 30, 45, 60].map((mins) => {
                  const isSelected = ambientState.sleepTimerMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSleepTimerChange(mins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif-scholarly transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                          : 'bg-[#F3EEDB] text-[#202820]/75 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
                      }`}
                    >
                      {mins === 0 ? 'Off (Continuous)' : `${mins} Minutes`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactile Sound Effects Deck */}
            <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DAC1] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B59A62]" />
                  <div>
                    <h5 className="font-serif-scholarly font-bold text-xs text-[#173B2D]">
                      Tactile Manuscript Sound Effects (Web Audio SFX)
                    </h5>
                    <p className="text-[11px] text-[#202820]/60 font-sans">
                      Organic acoustic feedback for parchment turns, quill nibs, wax seals, and brass bells.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playClickTactile();
                      setSfxMuted(!sfxState.isMuted);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-serif-scholarly border transition-colors cursor-pointer ${
                      sfxState.isMuted
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-[#173B2D]/10 border-[#173B2D]/30 text-[#173B2D]'
                    }`}
                  >
                    {sfxState.isMuted ? 'Tactile SFX: Muted' : 'Tactile SFX: Enabled'}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxState.volume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className="w-20 accent-[#173B2D] cursor-pointer h-1.5 bg-[#E3DAC1] rounded-lg"
                    title="SFX Volume"
                  />
                </div>
              </div>

              {/* Preview SFX Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => playParchmentRustle()}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F3EEDB] hover:bg-[#EAE2C8] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
                >
                  <Scroll className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Parchment Turn</span>
                </button>

                <button
                  type="button"
                  onClick={() => playQuillScratch()}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F3EEDB] hover:bg-[#EAE2C8] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Quill Nib</span>
                </button>

                <button
                  type="button"
                  onClick={() => playWaxSealStamp()}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F3EEDB] hover:bg-[#EAE2C8] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Wax Seal</span>
                </button>

                <button
                  type="button"
                  onClick={() => playBrassBellChime()}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F3EEDB] hover:bg-[#EAE2C8] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#8E7541]" />
                  <span>Brass Bell</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  playClickTactile();
                  setIsModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB] text-xs font-serif-scholarly font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-[#B59A62]" />
                <span>Return to Study</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
