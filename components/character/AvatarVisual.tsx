'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ScholarAvatar, getAvatarById } from '@/lib/avatars';

interface AvatarVisualProps {
  avatarId: string;
  size?: number; // 40, 56, 80, 110
  userName?: string;
  showFloatingName?: boolean;
  className?: string;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const AvatarVisual: React.FC<AvatarVisualProps> = ({
  avatarId,
  size = 64,
  userName,
  showFloatingName = false,
  className = '',
  interactive = false,
  selected = false,
  onClick,
}) => {
  const avatar = getAvatarById(avatarId);

  // Render facial accessories and hairstyle specifically for each avatar ID
  const renderHairAndAccessories = () => {
    switch (avatar.id) {
      case 'scholar_m1': // Julian: Scholar Cap & Round Spectacles
        return (
          <>
            {/* Short neat parted hair */}
            <path d="M18 20 C22 14 42 14 46 20 C42 17 22 17 18 20 Z" fill="#2D2218" />
            {/* Academic Cap */}
            <path d="M32 7 L50 14 L32 20 L14 14 Z" fill="#173B2D" stroke="#173B2D" strokeWidth="1.5" />
            <path d="M46 16 V22 L48 24" stroke="#B59A62" strokeWidth="1.2" />
            {/* Round Spectacles */}
            <circle cx="25" cy="30" r="4.5" fill="none" stroke="#B59A62" strokeWidth="1.2" />
            <circle cx="39" cy="30" r="4.5" fill="none" stroke="#B59A62" strokeWidth="1.2" />
            <line x1="29.5" y1="30" x2="34.5" y2="30" stroke="#B59A62" strokeWidth="1.2" />
          </>
        );
      case 'scholar_m2': // Elijah: Curled Hair & Monocle
        return (
          <>
            {/* Curled Hair */}
            <path d="M14 26 C12 16 22 12 32 12 C42 12 52 16 50 26 C46 16 18 16 14 26 Z" fill="#422918" />
            <circle cx="16" cy="24" r="3.5" fill="#422918" />
            <circle cx="48" cy="24" r="3.5" fill="#422918" />
            {/* Monocle on right eye */}
            <circle cx="39" cy="30" r="5" fill="none" stroke="#B59A62" strokeWidth="1.4" />
            <path d="M44 32 Q48 38 46 44" fill="none" stroke="#B59A62" strokeWidth="1" strokeDasharray="1.5 1.5" />
          </>
        );
      case 'scholar_m3': // Tobias: Neat Coif & Quill behind ear
        return (
          <>
            {/* Smooth brown coif */}
            <path d="M16 26 C16 14 48 14 48 26 C44 18 20 18 16 26 Z" fill="#1E1E1E" />
            {/* Quill feather tucked behind right ear */}
            <path d="M48 20 Q56 12 58 8 Q56 14 50 26 Z" fill="#B59A62" stroke="#173B2D" strokeWidth="1" />
          </>
        );
      case 'scholar_m4': // Leon: Hooded robe / Star crest
        return (
          <>
            {/* Scholar Hood drape */}
            <path d="M12 36 C10 18 20 10 32 10 C44 10 54 18 52 36 C48 16 16 16 12 36 Z" fill="#1B2C3B" />
            {/* Tiny golden astrolabe star on forehead */}
            <polygon points="32,15 33,18 36,18 33.5,20 34.5,23 32,21 29.5,23 30.5,20 28,18 31,18" fill="#B59A62" />
          </>
        );
      case 'scholar_f1': // Sophia: Braided Bun & Laurel
        return (
          <>
            {/* Braided Crown */}
            <path d="M14 26 C16 14 48 14 50 26 C44 16 20 16 14 26 Z" fill="#382012" />
            {/* High braided bun */}
            <circle cx="32" cy="11" r="6" fill="#382012" stroke="#B59A62" strokeWidth="1" />
            {/* Laurel sprig */}
            <path d="M22 17 Q25 15 28 17" fill="none" stroke="#A9C9A9" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M36 17 Q39 15 42 17" fill="none" stroke="#A9C9A9" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'scholar_f2': // Beatrice: Oval Spectacles & Ribbon
        return (
          <>
            {/* Soft wavy dark hair */}
            <path d="M14 30 C12 16 22 12 32 12 C42 12 52 16 50 30 C46 16 18 16 14 30 Z" fill="#201815" />
            {/* Oval Spectacles */}
            <ellipse cx="25" cy="30" rx="4" ry="3.5" fill="none" stroke="#B59A62" strokeWidth="1.2" />
            <ellipse cx="39" cy="30" rx="4" ry="3.5" fill="none" stroke="#B59A62" strokeWidth="1.2" />
            <line x1="29" y1="30" x2="35" y2="30" stroke="#B59A62" strokeWidth="1.2" />
            {/* Silk Headband */}
            <path d="M15 22 Q32 16 49 22" fill="none" stroke="#A9C9A9" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'scholar_f3': // Miriam: Twin twists & Emerald Pin
        return (
          <>
            {/* Auburn hair with twin twists */}
            <path d="M14 28 C14 14 50 14 50 28 C45 18 19 18 14 28 Z" fill="#5A2E1A" />
            <circle cx="15" cy="32" r="4" fill="#5A2E1A" />
            <circle cx="49" cy="32" r="4" fill="#5A2E1A" />
            {/* Emerald hair brooch */}
            <circle cx="21" cy="20" r="2.5" fill="#2C5E4B" stroke="#B59A62" strokeWidth="1" />
          </>
        );
      case 'scholar_f4': // Clara: Hairpin & Sleek Bun
        return (
          <>
            {/* Sleek updo */}
            <path d="M16 28 C18 15 46 15 48 28 C44 17 20 17 16 28 Z" fill="#1A1816" />
            <circle cx="32" cy="12" r="5" fill="#1A1816" />
            {/* Golden Scholar Hairpin crossing bun */}
            <line x1="24" y1="16" x2="40" y2="8" stroke="#B59A62" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onClick={onClick}
    >
      <motion.div
        whileHover={interactive ? { scale: 1.05, y: -2 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        className={`relative rounded-full transition-all ${
          selected
            ? 'ring-3 ring-[#B59A62] ring-offset-2 ring-offset-[#F3EEDB] shadow-md'
            : ''
        } ${interactive ? 'cursor-pointer' : ''}`}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Robe Collar */}
          <path
            d="M12 56 C14 44 22 40 32 40 C42 40 50 44 52 56 Z"
            fill={avatar.robeColor}
            stroke="#173B2D"
            strokeWidth="1.8"
          />
          {/* Inner Tunic / Lapel */}
          <path
            d="M26 40 L32 49 L38 40"
            fill="none"
            stroke={avatar.accentColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Circular Geometric Head */}
          <circle
            cx="32"
            cy="30"
            r="17"
            fill="#FAF7EE"
            stroke="#173B2D"
            strokeWidth="2.2"
          />

          {/* Soft Sage Cheeks */}
          <circle cx="21" cy="33" r="2.2" fill="#A9C9A9" fillOpacity="0.5" />
          <circle cx="43" cy="33" r="2.2" fill="#A9C9A9" fillOpacity="0.5" />

          {/* Eyes */}
          <circle cx="25" cy="30" r="2.5" fill="#173B2D" />
          <circle cx="39" cy="30" r="2.5" fill="#173B2D" />
          <circle cx="26" cy="29" r="0.9" fill="#F3EEDB" />
          <circle cx="40" cy="29" r="0.9" fill="#F3EEDB" />

          {/* Gentle Smile */}
          <path
            d="M29 36 Q32 39 35 36"
            fill="none"
            stroke="#173B2D"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Distinctive Hair & Accessories */}
          {renderHairAndAccessories()}
        </svg>

        {selected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B59A62] text-[#173B2D] flex items-center justify-center text-[10px] font-bold shadow-xs">
            ✓
          </div>
        )}
      </motion.div>

      {/* CONCEPT.md Section 8.2: Floating Name Treatment (with spring physics) */}
      {showFloatingName && userName && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly shadow-xs border border-[#B59A62]/40 whitespace-nowrap"
        >
          {userName}
        </motion.div>
      )}
    </div>
  );
};
