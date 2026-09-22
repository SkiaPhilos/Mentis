'use client';

import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { playClickTactile } from '@/lib/audio/soundEffects';

interface VoiceDictationButtonProps {
  onTranscription: (text: string) => void;
  compact?: boolean;
  className?: string;
  tooltip?: string;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscription,
  compact = false,
  className = '',
  tooltip = 'Dictate into manuscript via voice',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    isListening,
    isSupported,
    interimTranscript,
    error,
    toggleListening,
  } = useVoiceTranscription({
    onFinalResult: (finalText) => {
      if (finalText.trim()) {
        onTranscription(finalText.trim());
      }
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClickTactile();
    toggleListening();
  };

  if (!isSupported) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          disabled
          className={`opacity-40 cursor-not-allowed rounded-xl p-2 text-[#202820]/40 border border-[#E3DAC1]/60 ${className}`}
          title="Voice dictation is not supported by this browser engine (Supported on Chrome, Edge, Safari)."
        >
          <MicOff className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id="voice-dictation-btn"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative flex items-center justify-center transition-all cursor-pointer rounded-xl ${
          isListening
            ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-400/50 animate-pulse'
            : 'bg-[#FAF7EE] hover:bg-[#EAE2C8] text-[#173B2D] border border-[#E3DAC1] hover:border-[#B59A62]'
        } ${compact ? 'p-1.5' : 'p-2 sm:px-2.5 sm:py-2'} ${className}`}
        title={isListening ? 'Click to stop voice dictation' : tooltip}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5">
            <Mic className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white animate-bounce`} />
            {!compact && (
              <span className="text-[11px] font-serif-scholarly font-semibold tracking-wide">
                Listening...
              </span>
            )}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Mic className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#8E7541]`} />
            {!compact && (
              <span className="text-[11px] font-serif-scholarly text-[#173B2D]">
                Dictate
              </span>
            )}
          </div>
        )}
      </button>

      {/* Interim transcription preview or error pill */}
      {isListening && interimTranscript && (
        <div className="absolute left-0 bottom-full mb-2 z-50 px-3 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly shadow-lg whitespace-nowrap max-w-xs truncate border border-[#B59A62]/40">
          <span className="opacity-70 italic mr-1.5">Hearing:</span>
          &ldquo;{interimTranscript}&rdquo;
        </div>
      )}

      {error && !isListening && (
        <div className="absolute left-0 bottom-full mb-2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-sans border border-rose-200 shadow-md whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showTooltip && !isListening && !error && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden sm:block z-40 px-2.5 py-1 rounded-lg bg-[#202820] text-[#F3EEDB] text-[10px] font-serif-scholarly shadow-md whitespace-nowrap pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
};
