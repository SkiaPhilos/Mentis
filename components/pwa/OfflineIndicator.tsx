'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="mentis-offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] px-3.5 py-2 text-xs font-serif-scholarly shadow-lg border border-[#B59A62]/40 animate-fade-in"
    >
      <span className="h-2 w-2 rounded-full bg-[#B59A62] animate-pulse" />
      <WifiOff className="w-3.5 h-3.5 text-[#B59A62]" />
      <span>Offline Sanctuary Mode — Using cached scholarly records</span>
    </div>
  );
};
