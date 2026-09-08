export interface ColorPalette {
  primary: string;
  deep: string;
  light: string;
  border: string;
  text: string;
}

export const ACCENT_PALETTES: Record<string, ColorPalette> = {
  yellow: {
    primary: '#FBBF24',
    deep: '#D97706',
    light: '#FEF9C3',
    border: '#FDE68A',
    text: '#854D0E',
  },
  mint: {
    primary: '#34D399',
    deep: '#059669',
    light: '#D1FAE5',
    border: '#A7F3D0',
    text: '#065F46',
  },
  pink: {
    primary: '#F472B6',
    deep: '#DB2777',
    light: '#FCE7F3',
    border: '#FBCFE8',
    text: '#9D174D',
  },
  lavender: {
    primary: '#A78BFA',
    deep: '#7C3AED',
    light: '#EDE9FE',
    border: '#DDD6FE',
    text: '#5B21B6',
  },
  blue: {
    primary: '#38BDF8',
    deep: '#0284C7',
    light: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0369A1',
  },
  peach: {
    primary: '#FB923C',
    deep: '#EA580C',
    light: '#FFEDD5',
    border: '#FED7AA',
    text: '#9A3412',
  },
};

export const COLORS = {
  light: {
    background: '#FAF9F5',
    backgroundSecondary: '#F4F2EB',
    card: '#FFFFFF',
    cardSecondary: '#F8F7F2',
    border: '#EBE8DE',
    borderLight: '#F3F1E9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.45)',
    actionPill: '#0F172A',
    actionPillText: '#FFFFFF',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    fab: '#FBBF24',
    fabIcon: '#0F172A',
  },
  dark: {
    background: '#0B0F19',
    backgroundSecondary: '#121826',
    card: '#182234',
    cardSecondary: '#1E293B',
    border: '#2A374D',
    borderLight: '#232E42',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F172A',
    overlay: 'rgba(0, 0, 0, 0.7)',
    actionPill: '#F8FAFC',
    actionPillText: '#0F172A',
    danger: '#F87171',
    dangerLight: '#451A1A',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#452A0B',
    fab: '#FBBF24',
    fabIcon: '#0F172A',
  },
};

export type AccentColor = keyof typeof ACCENT_PALETTES;
