'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Feather, Download, X, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install, dismiss } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    if (compact) {
      return (
        <button
          id="mentis-pwa-install-compact-btn"
          onClick={install}
          title="Keep Mentis close — Add to home screen"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif-scholarly font-medium text-[#173B2D] bg-[#EAE2C8] hover:bg-[#E3D8B8] border border-[#B59A62]/40 rounded-md transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#B59A62]" />
          <span>Install Mentis</span>
        </button>
      );
    }

    return (
      <div
        id="mentis-pwa-install-banner"
        className="relative flex items-center justify-between gap-3 p-3 bg-[#FAF7EE] border border-[#B59A62]/50 rounded-xl shadow-sm text-[#173B2D] text-sm"
      >
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-[#173B2D] text-[#F3EEDB] mt-0.5">
            <Feather className="w-4 h-4 text-[#B59A62]" />
          </div>
          <div>
            <h4 className="font-serif-scholarly font-semibold text-[#173B2D] leading-tight">
              Keep Mentis close
            </h4>
            <p className="text-xs text-[#202820]/75 mt-0.5 font-sans">
              Add your scholarly sanctuary to this device for offline access & faster study.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="mentis-pwa-install-confirm-btn"
            onClick={install}
            className="px-3 py-1.5 text-xs font-serif-scholarly font-medium bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] rounded-lg shadow-xs transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3 text-[#B59A62]" />
            <span>Install</span>
          </button>
          <button
            id="mentis-pwa-install-dismiss-btn"
            onClick={dismiss}
            title="Dismiss reminder"
            className="p-1.5 text-[#202820]/50 hover:text-[#202820] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        {compact ? (
          <button
            id="mentis-pwa-ios-guide-compact-btn"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif-scholarly text-[#173B2D] bg-[#EAE2C8] hover:bg-[#E3D8B8] border border-[#B59A62]/40 rounded-md transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <div
            id="mentis-pwa-ios-banner"
            className="flex items-center justify-between gap-3 p-3 bg-[#FAF7EE] border border-[#B59A62]/40 rounded-xl text-[#173B2D] text-sm"
          >
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-[#B59A62]" />
              <span className="text-xs font-serif-scholarly text-[#173B2D]">
                Install Mentis on your iPhone / iPad
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-2.5 py-1 text-xs font-serif-scholarly bg-[#173B2D] text-[#F3EEDB] rounded-lg"
              >
                Instructions
              </button>
              <button
                onClick={dismiss}
                className="p-1 text-[#202820]/40 hover:text-[#202820]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {showIOSGuide && (
          <div
            id="mentis-pwa-ios-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[#F3EEDB] p-6 shadow-2xl border border-[#B59A62]/50 text-[#173B2D]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
                <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                  Install Mentis on iOS
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[#202820]/60 hover:text-[#202820]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#202820]/90">
                <div className="flex items-center gap-3 p-2.5 bg-[#FAF7EE] rounded-xl border border-[#E3DAC1]">
                  <Share2 className="w-5 h-5 text-[#B59A62] shrink-0" />
                  <p className="text-xs">
                    1. Tap the <strong>Share</strong> button in your Safari toolbar.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#FAF7EE] rounded-xl border border-[#E3DAC1]">
                  <PlusSquare className="w-5 h-5 text-[#B59A62] shrink-0" />
                  <p className="text-xs">
                    2. Scroll down and choose <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#FAF7EE] rounded-xl border border-[#E3DAC1]">
                  <Feather className="w-5 h-5 text-[#B59A62] shrink-0" />
                  <p className="text-xs">
                    3. Launch Mentis directly from your home screen as a standalone scholarly app.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#173B2D] py-2.5 text-sm font-serif-scholarly font-medium text-[#F3EEDB] hover:bg-[#122E23] transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
