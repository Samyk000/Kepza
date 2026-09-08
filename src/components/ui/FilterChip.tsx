import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  count,
  style,
}) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? themeColors.actionPill : themeColors.card,
          borderColor: selected ? themeColors.actionPill : themeColors.border,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          TYPOGRAPHY.subhead,
          styles.label,
          {
            color: selected ? themeColors.actionPillText : themeColors.text,
            fontWeight: selected ? '700' : '500',
            marginLeft: icon ? SPACING.xs : 0,
          },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.countText,
            {
              color: selected ? themeColors.actionPillText : themeColors.textMuted,
            },
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 1,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  label: {
    letterSpacing: -0.1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    opacity: 0.8,
  },
});
