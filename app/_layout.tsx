import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from '../src/components/ui/Toast';
import { AddLinkModal } from '../src/components/sheets/AddLinkModal';
import { getDatabase } from '../src/db/client';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUiStore } from '../src/store/uiStore';
import * as Clipboard from 'expo-clipboard';

export default function RootLayout() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const openAddModal = useUiStore((s) => s.openAddModal);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    // Disable browser outline and highlight on web inputs
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.id = 'kepza-global-web-styles';
      style.textContent = `
        *, *:focus, *:focus-visible, *:active {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        input, textarea, select, button, a, [tabindex], [data-focusable="true"] {
          outline: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        input:focus, textarea:focus, select:focus, button:focus, [data-focusable="true"]:focus {
          outline: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
        }
        ::placeholder {
          user-select: none;
        }
      `;
      if (!document.getElementById('kepza-global-web-styles')) {
        document.head.appendChild(style);
      }
    }

    // Initialize SQLite database
    getDatabase().catch((err) => {
      console.warn('Database initialization error:', err);
    });

    // Check clipboard for copied URL on launch
    Clipboard.hasStringAsync().then(async (hasString) => {
      if (hasString) {
        const text = await Clipboard.getStringAsync();
        if (text && /^https?:\/\//i.test(text.trim())) {
          showToast('Copied URL detected. Tap + to save.', 'info');
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="link/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="collection/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>

      <Toast />
      <AddLinkModal />
    </SafeAreaProvider>
  );
}
