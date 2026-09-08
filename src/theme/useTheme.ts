import { useSettingsStore } from '../store/settingsStore';
import { COLORS, ACCENT_PALETTES, AccentColor } from './colors';

export function useTheme() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const accentColor = useSettingsStore((s) => s.accentColor) || 'yellow';
  const isDark = themeMode === 'dark';
  const base = isDark ? COLORS.dark : COLORS.light;
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.yellow;

  return {
    isDark,
    themeMode,
    accentColor,
    accent,
    themeColors: {
      ...base,
      accent: accent.primary,
      accentDeep: accent.deep,
      accentLight: accent.light,
      accentBorder: accent.border,
      accentText: accent.text,
      fab: accent.primary,
      fabIcon: '#0F172A',
      activeTab: accent.primary,
      activeTabText: '#0F172A',
    },
  };
}
