import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Download,
  Upload,
  HardDrive,
  Inbox,
  Globe,
  Sliders,
  Sparkles,
  Smartphone,
  HelpCircle,
  Shield,
  FileText,
  ChevronRight,
  Sprout,
  Edit2,
} from 'lucide-react-native';
import { COLORS, ACCENT_PALETTES, AccentColor } from '../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../src/theme/tokens';
import { TYPOGRAPHY } from '../src/theme/typography';
import { useSettingsStore, ThemeMode } from '../src/store/settingsStore';
import { exportLibrary, importLibrary } from '../src/services/backup';
import { useUiStore } from '../src/store/uiStore';
import { useTheme } from '../src/theme/useTheme';
import { triggerHaptic } from '../src/utils/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, accent, themeColors } = useTheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);
  const profile = useSettingsStore((s) => s.profile);
  const autoFetchPreview = useSettingsStore((s) => s.autoFetchPreview);
  const toggleAutoFetchPreview = useSettingsStore((s) => s.toggleAutoFetchPreview);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const toggleHapticFeedback = useSettingsStore((s) => s.toggleHapticFeedback);
  const browserChoice = useSettingsStore((s) => s.browserChoice);
  const setBrowserChoice = useSettingsStore((s) => s.setBrowserChoice);

  const showToast = useUiStore((s) => s.showToast);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const accentOptions: AccentColor[] = ['yellow', 'pink', 'lavender', 'mint', 'blue', 'peach'];

  const handleExport = async () => {
    try {
      await exportLibrary();
      showToast('Library exported successfully ✓', 'success');
    } catch (e) {
      showToast('Failed to export library', 'error');
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import Backup',
      'Select a Kepza JSON backup file to restore your links and collections.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select File',
          onPress: () => {
            showToast('Ready for file import', 'info');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color={themeColors.text} />
        </TouchableOpacity>

        <Text style={[TYPOGRAPHY.title1, styles.headerTitle, { color: themeColors.text }]}>
          Settings
        </Text>

        <View style={styles.quoteGraphicWrapper}>
          <View style={[styles.bubbleQuote, { backgroundColor: isDark ? '#1E293B' : accent.light, borderColor: isDark ? '#334155' : accent.border }]}>
            <Text style={[styles.bubbleQuoteText, { color: isDark ? accent.primary : accent.deep }]}>
              Same curiosity.{'\n'}A more organized you. :)
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: themeColors.card, borderColor: themeColors.border },
            SHADOWS.card,
          ]}
        >
          <View style={styles.profileMainRow}>
            <View style={[styles.avatarCircle, { backgroundColor: isDark ? accent.deep : accent.primary }]}>
              <Text style={[styles.avatarInitial, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {profile.avatarText}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[TYPOGRAPHY.title2, { color: themeColors.text }]}>
                {profile.name}
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, marginTop: 2 }]}>
                {profile.bio}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.border }]}
            onPress={() => showToast('Profile editor ready', 'info')}
          >
            <Edit2 size={13} color={themeColors.text} />
            <Text style={[TYPOGRAPHY.footnote, { color: themeColors.text, fontWeight: '600', marginLeft: 6 }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Appearance */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={18} color={themeColors.text} />
            <Text style={[TYPOGRAPHY.title3, styles.sectionTitle, { color: themeColors.text }]}>
              Appearance
            </Text>
          </View>

          {/* Theme Mode Toggle (Light / Dark / System) */}
          <View style={styles.themeToggleRow}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeModeBtn,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#334155'
                          : accent.light
                        : themeColors.cardSecondary,
                      borderColor: isSelected
                        ? accent.primary
                        : themeColors.border,
                    },
                  ]}
                >
                  {mode === 'light' && <Sun size={18} color={isSelected ? (isDark ? accent.primary : accent.deep) : themeColors.textSecondary} />}
                  {mode === 'dark' && <Moon size={18} color={isSelected ? (isDark ? accent.primary : accent.deep) : themeColors.textSecondary} />}
                  {mode === 'system' && <Monitor size={18} color={isSelected ? (isDark ? accent.primary : accent.deep) : themeColors.textSecondary} />}
                  <Text
                    style={[
                      styles.themeModeText,
                      {
                        color: isSelected ? themeColors.text : themeColors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {capitalize(mode)}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkIconWrapper}>
                      <Check size={12} color={isDark ? accent.primary : accent.deep} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Accent Color Picker */}
          <Text style={[TYPOGRAPHY.footnote, styles.subLabel, { color: themeColors.textSecondary }]}>
            Accent Color
          </Text>
          <View style={styles.accentColorsRow}>
            {accentOptions.map((c) => {
              const isChosen = accentColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setAccentColor(c);
                    showToast(`Accent set to ${capitalize(c)} ✓`, 'info');
                  }}
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: ACCENT_PALETTES[c].primary,
                      borderWidth: isChosen ? 3 : 0,
                      borderColor: isDark ? '#FFFFFF' : '#0F172A',
                      transform: [{ scale: isChosen ? 1.15 : 1.0 }],
                    },
                  ]}
                >
                  {isChosen && (
                    <Check size={14} color="#0F172A" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Data & Storage */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
          <View style={styles.sectionHeaderRow}>
            <HardDrive size={18} color={themeColors.text} />
            <Text style={[TYPOGRAPHY.title3, styles.sectionTitle, { color: themeColors.text }]}>
              Data & Storage
            </Text>
          </View>

          <TouchableOpacity onPress={handleExport} style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <Download size={18} color={themeColors.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                Export Data
              </Text>
              <Text style={[TYPOGRAPHY.footnote, { color: themeColors.textSecondary }]}>
                Backup your links, notes and collections
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleImport} style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <Upload size={18} color={themeColors.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                Import Data
              </Text>
              <Text style={[TYPOGRAPHY.footnote, { color: themeColors.textSecondary }]}>
                Import from browser bookmarks or JSON
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 3: Behavior */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
          <View style={styles.sectionHeaderRow}>
            <Sliders size={18} color={themeColors.text} />
            <Text style={[TYPOGRAPHY.title3, styles.sectionTitle, { color: themeColors.text }]}>
              Behavior
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <Smartphone size={18} color={themeColors.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                Haptic Feedback
              </Text>
              <Text style={[TYPOGRAPHY.footnote, { color: themeColors.textSecondary }]}>
                Feel tactile clicks for tabs, buttons & saves
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={() => {
                toggleHapticFeedback();
                if (!hapticFeedback) {
                  setTimeout(() => triggerHaptic('medium'), 60);
                }
              }}
              trackColor={{ false: themeColors.border, true: accent.primary }}
            />
          </View>
        </View>

        {/* Section 4: About */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
          <View style={styles.settingRow}>
            <View style={[styles.logoMiniSquare, { backgroundColor: accent.primary }]}>
              <Text style={{ fontWeight: '800', color: '#0F172A', fontSize: 13 }}>K</Text>
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                App Version
              </Text>
              <Text style={[TYPOGRAPHY.footnote, { color: themeColors.textSecondary }]}>
                Kepza v1.0.0
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: '#059669', fontWeight: '600' }]}>Up to date</Text>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <HelpCircle size={18} color={themeColors.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                Help & Feedback
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <Shield size={18} color={themeColors.textSecondary} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Footer Card with Sprout */}
        <View style={[styles.footerBanner, { backgroundColor: isDark ? '#064E3B' : ACCENT_PALETTES.mint.light }]}>
          <Sprout size={22} color="#059669" />
          <View style={styles.footerTextCol}>
            <Text style={[TYPOGRAPHY.subhead, { color: isDark ? '#A7F3D0' : '#065F46', fontWeight: '700' }]}>
              Thanks for using Kepza!
            </Text>
            <Text style={[TYPOGRAPHY.footnote, { color: isDark ? '#6EE7B7' : '#047857' }]}>
              Small saves. Big tomorrows. ♡
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    position: 'relative',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: SPACING.md,
    letterSpacing: -0.5,
  },
  quoteGraphicWrapper: {
    position: 'absolute',
    right: SPACING.lg,
    top: 4,
  },
  bubbleQuote: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    transform: [{ rotate: '4deg' }],
  },
  bubbleQuoteText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  profileCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingVertical: SPACING.xs + 2,
    marginTop: SPACING.md,
  },
  sectionCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs + 2,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  themeModeBtn: {
    flex: 1,
    height: 68,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 4,
  },
  themeModeText: {
    fontSize: 12,
  },
  checkIconWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLabel: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  accentColorsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  accentDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  settingIconCol: {
    width: 28,
    marginRight: SPACING.sm,
  },
  settingTextCol: {
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  logoMiniSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  footerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    gap: SPACING.md,
  },
  footerTextCol: {
    flex: 1,
  },
});
