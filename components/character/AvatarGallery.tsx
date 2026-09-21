'use client';

import React, { useState } from 'react';
import { SCHOLAR_AVATARS, ScholarAvatar } from '@/lib/avatars';
import { AvatarVisual } from './AvatarVisual';

interface AvatarGalleryProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
  className?: string;
}

export const AvatarGallery: React.FC<AvatarGalleryProps> = ({
  selectedAvatarId,
  onSelect,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'masculine' | 'feminine'>('all');

  const filteredAvatars = SCHOLAR_AVATARS.filter(
    (a) => filter === 'all' || a.gender === filter
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Gender Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[#EAE2C8] rounded-xl border border-[#E3DAC1] w-fit mx-auto text-xs font-serif-scholarly">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs font-semibold'
              : 'text-[#202820]/70 hover:text-[#202820]'
          }`}
        >
          All 8 Scholars
        </button>
        <button
          type="button"
          onClick={() => setFilter('masculine')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'masculine'
              ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs font-semibold'
              : 'text-[#202820]/70 hover:text-[#202820]'
          }`}
        >
          Masculine (4)
        </button>
        <button
          type="button"
          onClick={() => setFilter('feminine')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            filter === 'feminine'
              ? 'bg-[#173B2D] text-[#F3EEDB] shadow-xs font-semibold'
              : 'text-[#202820]/70 hover:text-[#202820]'
          }`}
        >
          Feminine (4)
        </button>
      </div>

      {/* Avatars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {filteredAvatars.map((avatar: ScholarAvatar) => {
          const isSelected = avatar.id === selectedAvatarId;
          return (
            <div
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#FAF7EE] border-[#B59A62] shadow-md ring-2 ring-[#B59A62]/50 scale-[1.02]'
                  : 'bg-[#FAF7EE]/60 border-[#E3DAC1] hover:border-[#B59A62]/60 hover:bg-[#FAF7EE]'
              }`}
            >
              <AvatarVisual
                avatarId={avatar.id}
                size={68}
                selected={isSelected}
                interactive={false}
              />
              <div className="mt-2.5">
                <p className="font-serif-scholarly font-bold text-xs text-[#173B2D] leading-tight">
                  {avatar.name}
                </p>
                <p className="text-[11px] text-[#202820]/60 mt-0.5 leading-snug">
                  {avatar.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
