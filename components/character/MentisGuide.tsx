'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GuideEmotion, GuideMessage } from './guideStates';

interface MentisGuideProps {
  emotion?: GuideEmotion;
  size?: number; // size in pixels (e.g. 48, 64, 96, 120)
  message?: GuideMessage | null;
  interactive?: boolean;
  className?: string;
  onEmotionChange?: (emotion: GuideEmotion) => void;
}

export const MentisGuide: React.FC<MentisGuideProps> = ({
  emotion: controlledEmotion,
  size = 64,
  message,
  interactive = true,
  className = '',
}) => {
  const [internalEmotion, setInternalEmotion] = useState<GuideEmotion>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [dismissedMessage, setDismissedMessage] = useState(false);

  const currentEmotion = controlledEmotion || internalEmotion;

  // Natural blinking cycle every 4 to 7 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4500 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  const handlePointerInteraction = () => {
    if (!interactive) return;
    const reactions: GuideEmotion[] = ['smile', 'curious', 'surprised', 'thinking', 'celebratory'];
    const next = reactions[Math.floor(Math.random() * reactions.length)];
    setInternalEmotion(next);
    setTimeout(() => setInternalEmotion('idle'), 2400);
  };

  // Eyes rendering based on emotion
  const renderEyes = () => {
    if (isBlinking || currentEmotion === 'blink' || currentEmotion === 'sleepy') {
      return (
        <g stroke="#173B2D" strokeWidth="2.5" strokeLinecap="round">
          <path d="M16 26 Q20 28 24 26" fill="none" />
          <path d="M40 26 Q44 28 48 26" fill="none" />
        </g>
      );
    }

    if (currentEmotion === 'smile' || currentEmotion === 'celebratory') {
      return (
        <g stroke="#173B2D" strokeWidth="2.5" strokeLinecap="round">
          <path d="M16 26 Q20 21 24 26" fill="none" />
          <path d="M40 26 Q44 21 48 26" fill="none" />
        </g>
      );
    }

    if (currentEmotion === 'surprised') {
      return (
        <g fill="#173B2D">
          <circle cx="20" cy="24" r="4.5" />
          <circle cx="44" cy="24" r="4.5" />
          <circle cx="21" cy="22.5" r="1.5" fill="#F3EEDB" />
          <circle cx="45" cy="22.5" r="1.5" fill="#F3EEDB" />
        </g>
      );
    }

    if (currentEmotion === 'thinking') {
      return (
        <g fill="#173B2D">
          {/* Eyes looking up and to the right */}
          <circle cx="21" cy="22" r="3.5" />
          <circle cx="45" cy="22" r="3.5" />
          <circle cx="22" cy="21" r="1.2" fill="#F3EEDB" />
          <circle cx="46" cy="21" r="1.2" fill="#F3EEDB" />
          {/* Subtle thinking monocle / golden lens on left eye */}
          <circle cx="20" cy="24" r="7" fill="none" stroke="#B59A62" strokeWidth="1.5" />
          <line x1="15" y1="30" x2="13" y2="35" stroke="#B59A62" strokeWidth="1.2" />
        </g>
      );
    }

    if (currentEmotion === 'curious' || currentEmotion === 'listening') {
      return (
        <g fill="#173B2D">
          {/* One eye slightly larger */}
          <circle cx="20" cy="24" r="4" />
          <circle cx="44" cy="24" r="3" />
          <circle cx="21" cy="23" r="1.2" fill="#F3EEDB" />
          <circle cx="45" cy="23" r="1" fill="#F3EEDB" />
        </g>
      );
    }

    // Default Idle eyes
    return (
      <g fill="#173B2D">
        <circle cx="20" cy="24" r="3.5" />
        <circle cx="44" cy="24" r="3.5" />
        <circle cx="21.2" cy="23" r="1.2" fill="#F3EEDB" />
        <circle cx="45.2" cy="23" r="1.2" fill="#F3EEDB" />
      </g>
    );
  };

  // Mouth rendering based on emotion
  const renderMouth = () => {
    if (currentEmotion === 'smile' || currentEmotion === 'celebratory') {
      return (
        <path
          d="M26 34 Q32 41 38 34"
          fill="none"
          stroke="#173B2D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      );
    }

    if (currentEmotion === 'surprised') {
      return <circle cx="32" cy="35" r="3" fill="#173B2D" />;
    }

    if (currentEmotion === 'thinking') {
      return (
        <path
          d="M28 35 Q32 34 36 36"
          fill="none"
          stroke="#173B2D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    }

    if (currentEmotion === 'concerned' || currentEmotion === 'confused') {
      return (
        <path
          d="M27 36 Q32 33 37 36"
          fill="none"
          stroke="#173B2D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    }

    // Minimal calm mouth
    return (
      <path
        d="M28 35 Q32 37 36 35"
        fill="none"
        stroke="#173B2D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  };

  // Temporary hands (CONCEPT.md Section 7.1: "temporary small simple hands/arms appear when pointing/presenting")
  const renderTemporaryHands = () => {
    if (currentEmotion === 'pointing') {
      return (
        <motion.g
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
        >
          {/* Right hand pointing outward */}
          <path
            d="M52 32 Q62 26 66 22 Q68 20 66 18 Q63 17 56 22 L52 28 Z"
            fill="#E5DDC3"
            stroke="#173B2D"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </motion.g>
      );
    }

    if (currentEmotion === 'presenting' || currentEmotion === 'celebratory') {
      return (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Two small raised hands */}
          <circle cx="6" cy="24" r="4.5" fill="#E5DDC3" stroke="#173B2D" strokeWidth="1.8" />
          <circle cx="58" cy="24" r="4.5" fill="#E5DDC3" stroke="#173B2D" strokeWidth="1.8" />
        </motion.g>
      );
    }

    return null;
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech / Guidance Bubble */}
      <AnimatePresence>
        {message && !dismissedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute bottom-full mb-2 z-30 max-w-xs w-max rounded-xl bg-[#FAF7EE] border border-[#B59A62]/60 p-3 shadow-md text-[#173B2D] text-xs font-serif-scholarly leading-relaxed"
          >
            <div className="flex items-start justify-between gap-2">
              <p>{message.text}</p>
              <button
                onClick={() => setDismissedMessage(true)}
                className="text-[#202820]/40 hover:text-[#202820] text-xs p-0.5"
                title="Dismiss message"
              >
                ✕
              </button>
            </div>
            {message.actionLabel && message.onAction && (
              <button
                onClick={message.onAction}
                className="mt-2 block w-full py-1 text-center font-medium bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] rounded-md transition-colors"
              >
                {message.actionLabel}
              </button>
            )}
            {/* Bubble Tail pointing down to guide */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-[#B59A62]/60 border-t-6 border-x-transparent border-x-5 border-b-0 w-0 h-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Character Visual */}
      <motion.div
        whileHover={interactive ? { scale: 1.06, y: -2 } : {}}
        whileTap={interactive ? { scale: 0.94 } : {}}
        onClick={handlePointerInteraction}
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        title={interactive ? 'The Mentis Guide — Click to interact' : 'The Mentis Guide'}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Subtle magical aura ring in aged gold */}
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="#B59A62"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="2 3"
          />

          {/* Temporary Hands */}
          {renderTemporaryHands()}

          {/* Base Face: Circular geometric head in warm parchment with soft sage blush */}
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="#FAF7EE"
            stroke="#173B2D"
            strokeWidth="2.5"
          />

          {/* Soft Sage Cheeks */}
          <circle cx="15" cy="32" r="3" fill="#A9C9A9" fillOpacity="0.45" />
          <circle cx="49" cy="32" r="3" fill="#A9C9A9" fillOpacity="0.45" />

          {/* Celestial Guide Feather Tuft / Scholarly crest on forehead */}
          <path
            d="M32 8 C33 4 37 4 36 8 C35 11 33 13 32 15 Z"
            fill="#B59A62"
            stroke="#173B2D"
            strokeWidth="1.2"
          />

          {/* Eyes & Mouth */}
          {renderEyes()}
          {renderMouth()}
        </svg>
      </motion.div>
    </div>
  );
};
