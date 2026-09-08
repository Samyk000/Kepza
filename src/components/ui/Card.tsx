import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, ACCENT_PALETTES, AccentColor } from '../../theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { useSettingsStore } from '../../store/settingsStore';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: AccentColor;
  variant?: 'default' | 'flat' | 'elevated';
  padding?: keyof typeof SPACING;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  accent,
  variant = 'default',
  padding = 'lg',
}) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  let backgroundColor = themeColors.card;
  let borderColor = themeColors.border;

  if (accent && ACCENT_PALETTES[accent]) {
    backgroundColor = isDark ? themeColors.cardSecondary : ACCENT_PALETTES[accent].light;
    borderColor = isDark ? themeColors.border : ACCENT_PALETTES[accent].border;
  }

  const shadowStyle =
    variant === 'elevated'
      ? SHADOWS.cardHover
      : variant === 'flat'
      ? undefined
      : SHADOWS.card;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          padding: SPACING[padding],
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
