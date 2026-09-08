import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AccentColor } from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';
export type BrowserChoice = 'in-app' | 'browser';

export interface UserProfile {
  name: string;
  bio: string;
  avatarText: string;
}

interface SettingsState {
  profile: UserProfile;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  defaultSaveLocation: string; // 'inbox' or collectionId
  browserChoice: BrowserChoice;
  autoFetchPreview: boolean;
  hapticFeedback: boolean;

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setDefaultSaveLocation: (location: string) => void;
  setBrowserChoice: (choice: BrowserChoice) => void;
  toggleAutoFetchPreview: () => void;
  toggleHapticFeedback: () => void;
}

const fallbackStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Sameer',
        bio: 'A keeper of random useful things.',
        avatarText: 'S',
      },
      themeMode: 'light',
      accentColor: 'yellow',
      defaultSaveLocation: 'inbox',
      browserChoice: 'in-app',
      autoFetchPreview: true,
      hapticFeedback: true,

      setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),
      setThemeMode: (themeMode) => set({ themeMode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setDefaultSaveLocation: (defaultSaveLocation) => set({ defaultSaveLocation }),
      setBrowserChoice: (browserChoice) => set({ browserChoice }),
      toggleAutoFetchPreview: () =>
        set((state) => ({ autoFetchPreview: !state.autoFetchPreview })),
      toggleHapticFeedback: () =>
        set((state) => ({ hapticFeedback: !state.hapticFeedback })),
    }),
    {
      name: 'kepza-settings-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : fallbackStorage
      ),
    }
  )
);

