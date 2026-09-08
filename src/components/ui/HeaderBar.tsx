import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { COLORS, ACCENT_PALETTES } from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';

import { useTheme } from '../../theme/useTheme';

interface HeaderBarProps {
  showSearch?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ showSearch = false }) => {
  const router = useRouter();
  const { isDark, accent, themeColors } = useTheme();
  const profile = useSettingsStore((s) => s.profile);

  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View style={styles.logoRow}>
          <Text style={[TYPOGRAPHY.title1, styles.logoText, { color: themeColors.text }]}>
            Kepza
          </Text>
          <View style={[styles.sparkle, { backgroundColor: accent.primary }]} />
        </View>
        <Text style={[TYPOGRAPHY.footnote, styles.tagline, { color: themeColors.textSecondary }]}>
          Keep what matters.
        </Text>
      </View>

      <View style={styles.actions}>
        {showSearch && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/find')}
            style={[
              styles.iconButton,
              {
                backgroundColor: themeColors.cardSecondary,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Search size={19} color={themeColors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push('/settings')}
          style={[
            styles.avatarButton,
            {
              backgroundColor: isDark ? accent.deep : accent.primary,
              borderColor: isDark ? accent.primary : accent.deep,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {profile.avatarText || 'S'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  brandContainer: {
    flexDirection: 'column',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sparkle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FBBF24',
    marginLeft: 4,
    marginBottom: 10,
    transform: [{ rotate: '45deg' }],
  },
  tagline: {
    marginTop: -2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
