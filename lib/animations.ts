import type {Transition, Variants} from 'motion/react';

// ── Shared Spring Presets ──────────────────────────────────────────────

/** Fast, tight spring for small UI elements (buttons, icons, toggles) */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

/** Slightly looser spring for windows and larger panels */
export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/** Playful bounce for dock magnification and celebratory moments */
export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 15,
};

/** Genie-style minimize/restore — physical squash feel */
export const springGenie: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 22,
};

// ── Duration Constants ─────────────────────────────────────────────────

/** Standard fade for UI transitions */
export const fadeDuration = 0.2;

// ── Reusable Animation Variants ────────────────────────────────────────

/** Dropdown menu (menu bar, context menus, tooltips) */
export const dropdownVariants: Variants = {
  hidden: {opacity: 0, scale: 0.95, y: -4},
  visible: {opacity: 1, scale: 1, y: 0},
  exit: {opacity: 0, scale: 0.95, y: -4},
};

/** Stagger container — apply to parent, children use staggerItem */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

/** Stagger item — apply to each child inside staggerContainer */
export const staggerItem: Variants = {
  hidden: {opacity: 0, scale: 0.8},
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
};

/** Spotlight result list stagger */
export const spotlightStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/** Spotlight result item */
export const spotlightItem: Variants = {
  hidden: {opacity: 0, y: 4},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: fadeDuration, ease: 'easeOut'},
  },
};

/** Settings tab content */
export const tabContentVariants: Variants = {
  hidden: {opacity: 0, y: 8},
  visible: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -8},
};

// ── Helper ─────────────────────────────────────────────────────────────

const instantTransition: Transition = {duration: 0.01};

/**
 * Returns the appropriate transition based on reduced motion preference.
 * Usage: const { windowTransition } = useAnimationConfig(reducedMotion);
 */
export function getAnimationConfig(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      windowTransition: instantTransition,
      dropdownTransition: instantTransition,
      snappyTransition: instantTransition,
      smoothTransition: instantTransition,
      bouncyTransition: instantTransition,
      genieTransition: instantTransition,
    };
  }
  return {
    windowTransition: springSmooth,
    dropdownTransition: {duration: fadeDuration},
    snappyTransition: springSnappy,
    smoothTransition: springSmooth,
    bouncyTransition: springBouncy,
    genieTransition: springGenie,
  };
}
