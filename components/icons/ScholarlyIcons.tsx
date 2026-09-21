import React from 'react';

export interface ScholarlyIconProps {
  size?: number;
  className?: string;
  active?: boolean;
  strokeWidth?: number;
}

/**
 * Library Icon: Two thick upright books with a smaller book placed horizontally over them,
 * primarily showing the book backs/spines (as specified in CONCEPT.md Section 6).
 */
export const ScholarlyLibraryIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upright Book 1 (Left) */}
      <rect
        x="4"
        y="7"
        width="5"
        height="14"
        rx="1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#A9C9A9' : 'none'}
        fillOpacity={active ? 0.25 : 0}
      />
      <line x1="6.5" y1="9" x2="6.5" y2="19" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" opacity="0.6" />
      <line x1="4" y1="11" x2="9" y2="11" stroke="#B59A62" strokeWidth={strokeWidth * 0.7} />

      {/* Upright Book 2 (Center) */}
      <rect
        x="10.5"
        y="6"
        width="5.5"
        height="15"
        rx="1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#173B2D' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
      <line x1="13.25" y1="8.5" x2="13.25" y2="19" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" opacity="0.6" />
      <circle cx="13.25" cy="11" r="0.75" fill="#B59A62" />

      {/* Horizontal Stacked Book across top */}
      <rect
        x="3"
        y="2.5"
        width="15"
        height="3.5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#B59A62' : 'none'}
        fillOpacity={active ? 0.3 : 0}
      />
      <line x1="5" y1="4.25" x2="16" y2="4.25" stroke="#B59A62" strokeWidth={strokeWidth * 0.7} />

      {/* Subtle Bookmark Ribbon hanging on the right */}
      <path
        d="M17.5 7V16L19 14.5L20.5 16V7"
        stroke="#B59A62"
        strokeWidth={strokeWidth * 0.9}
        fill="#B59A62"
        fillOpacity={0.4}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Notes Icon: A scroll/manuscript with a feather quill (CONCEPT.md Section 6 & 16).
 */
export const ScholarlyNotesIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Manuscript Scroll Rolled Edges */}
      <path
        d="M6 4C4.5 4 3.5 5 3.5 6.5C3.5 8 4.5 9 6 9H15C16.5 9 17.5 8 17.5 6.5C17.5 5 16.5 4 15 4H6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#F3EEDB' : 'none'}
      />
      {/* Scroll Body */}
      <path
        d="M3.5 6.5V17.5C3.5 19 4.5 20 6 20H15C16.5 20 17.5 19 17.5 17.5V6.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#A9C9A9' : 'none'}
        fillOpacity={active ? 0.2 : 0}
      />
      {/* Written Inscriptions on Scroll */}
      <line x1="6.5" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" opacity="0.6" />
      <line x1="6.5" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" opacity="0.6" />

      {/* Feather Quill Overlay */}
      <g transform="translate(11, 2) rotate(22)">
        <path
          d="M3 1Q-1 7 0 16Q4 10 3 1Z"
          fill="#B59A62"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.8}
        />
        <line x1="1.5" y1="1" x2="0.5" y2="18" stroke="currentColor" strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/**
 * Learning Icon: Scholarly celestial astrolabe / magical compass motif.
 */
export const ScholarlyLearningIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Astrolabe Ring */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#A9C9A9' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
      {/* Top Suspension Ring */}
      <circle cx="12" cy="3" r="1.5" stroke="#B59A62" strokeWidth={strokeWidth * 0.8} />

      {/* Inner Coordinate Ring */}
      <circle cx="12" cy="12" r="5.5" stroke="#B59A62" strokeWidth={strokeWidth * 0.75} strokeDasharray="3 3" />

      {/* Celestial 8-Point Star in Center */}
      <path
        d="M12 7L13 11L17 12L13 13L12 17L11 13L7 12L11 11Z"
        fill={active ? '#B59A62' : 'currentColor'}
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.6}
      />
      <circle cx="12" cy="12" r="1" fill="#F3EEDB" />
    </svg>
  );
};

/**
 * Schedule Icon: Manuscript sundial / calendar grid.
 */
export const ScholarlyScheduleIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Parchment Timetable Outline */}
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#FAF7EE' : 'none'}
      />
      {/* Top Binding Pegs */}
      <line x1="7" y1="2.5" x2="7" y2="5.5" stroke="#B59A62" strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
      <line x1="17" y1="2.5" x2="17" y2="5.5" stroke="#B59A62" strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
      <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth={strokeWidth * 0.9} />

      {/* Grid Timetable Slots */}
      <rect x="5.5" y="10.5" width="5.5" height="3.5" rx="0.5" fill="#A9C9A9" fillOpacity={0.4} stroke="currentColor" strokeWidth={strokeWidth * 0.5} />
      <rect x="13" y="10.5" width="5.5" height="3.5" rx="0.5" fill={active ? '#B59A62' : 'none'} fillOpacity={0.3} stroke="currentColor" strokeWidth={strokeWidth * 0.5} />
      <rect x="5.5" y="15.5" width="8" height="3.5" rx="0.5" fill={active ? '#173B2D' : '#A9C9A9'} fillOpacity={0.25} stroke="currentColor" strokeWidth={strokeWidth * 0.5} />
      <circle cx="16" cy="17" r="1.25" fill="#B59A62" />
    </svg>
  );
};

/**
 * Profile Icon: Geometric scholarly character head silhouette (matching guide / avatar language).
 */
export const ScholarlyProfileIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Scholarly Mortarboard / Academic Cap */}
      <path
        d="M12 3L21 7.5L12 12L3 7.5Z"
        fill={active ? '#173B2D' : 'none'}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Cap Tassel */}
      <path d="M19 8.5V13.5L20 15" stroke="#B59A62" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" strokeLinejoin="round" />

      {/* Circular Geometric Scholar Face */}
      <circle
        cx="12"
        cy="13.5"
        r="4.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#F3EEDB' : 'none'}
      />
      {/* Scholar Spectacles / Eyes */}
      <circle cx="10.5" cy="13.5" r="1" fill="currentColor" />
      <circle cx="13.5" cy="13.5" r="1" fill="currentColor" />
      <line x1="11.5" y1="13.5" x2="12.5" y2="13.5" stroke="currentColor" strokeWidth={strokeWidth * 0.8} />

      {/* Scholarly Robes */}
      <path
        d="M5.5 21C6 18.5 8.5 17 12 17C15.5 17 18 18.5 18.5 21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Desk Icon: The scholar's current study desk.
 */
export const ScholarlyDeskIcon: React.FC<ScholarlyIconProps> = ({
  size = 24,
  className = '',
  active = false,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Desk Top Surface */}
      <rect
        x="3"
        y="12"
        width="18"
        height="3"
        rx="0.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill={active ? '#173B2D' : '#FAF7EE'}
        fillOpacity={active ? 0.2 : 1}
      />
      {/* Open Book Resting on Desk */}
      <path
        d="M7 12L9 8C10.5 8.5 12 8 12 8C12 8 13.5 8.5 15 8L17 12"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
        strokeLinejoin="round"
      />
      {/* Candle / Lamp */}
      <line x1="5.5" y1="8" x2="5.5" y2="12" stroke="#B59A62" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="5.5" cy="6.5" r="1" fill="#B59A62" />

      {/* Desk Legs */}
      <line x1="5" y1="15" x2="5" y2="21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="19" y1="15" x2="19" y2="21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="5" y1="18" x2="19" y2="18" stroke="currentColor" strokeWidth={strokeWidth * 0.7} opacity="0.5" />
    </svg>
  );
};
