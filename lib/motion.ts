export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    deliberate: 0.5,
  },
  ease: {
    manuscript: [0.16, 1, 0.3, 1], // Gentle scholarly cubic-bezier
    parchmentLift: [0.34, 1.56, 0.64, 1], // Subtle spring pop
    smoothFade: [0.25, 0.1, 0.25, 1],
  },
  spring: {
    gentle: { type: 'spring', stiffness: 280, damping: 24 },
    responsive: { type: 'spring', stiffness: 400, damping: 30 },
    snappy: { type: 'spring', stiffness: 500, damping: 28 },
  },
};

export const pageFadeVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.manuscript } },
  exit: { opacity: 0, y: -4, transition: { duration: motionTokens.duration.instant } },
};

export const cardHoverVariants = {
  hover: { y: -3, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.manuscript } },
  tap: { scale: 0.98, transition: { duration: motionTokens.duration.instant } },
};
