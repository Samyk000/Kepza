import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function triggerHaptic(type: HapticType = 'light') {
  try {
    const isEnabled = useSettingsStore.getState().hapticFeedback;
    if (!isEnabled) return;

    if (Platform.OS === 'android') {
      switch (type) {
        case 'heavy':
        case 'error':
          Vibration.vibrate(35);
          break;
        case 'medium':
        case 'success':
        case 'warning':
          Vibration.vibrate(22);
          break;
        case 'selection':
        case 'light':
        default:
          Vibration.vibrate(12);
          break;
      }

      // Also trigger expo-haptics impactAsync
      const impactStyle =
        type === 'heavy' || type === 'error'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : type === 'medium' || type === 'success'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;

      Haptics.impactAsync(impactStyle).catch(() => {});
      return;
    }

    switch (type) {
      case 'selection':
        Haptics.selectionAsync().catch(() => {});
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
      case 'light':
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
    }
  } catch (e) {
    // Fail silently on unsupported platforms/emulators
  }
}
