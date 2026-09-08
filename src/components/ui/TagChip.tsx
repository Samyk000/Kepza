import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ACCENT_PALETTES, AccentColor } from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';

interface TagChipProps {
  label: string;
  color?: AccentColor | string;
  onPress?: () => void;
  onRemove?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  color = 'mint',
  onPress,
}) => {
  const palette = ACCENT_PALETTES[color as AccentColor] || ACCENT_PALETTES.mint;

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: palette.light,
          borderColor: palette.border,
        },
      ]}
    >
      <Text
        style={[
          TYPOGRAPHY.caption,
          styles.text,
          {
            color: palette.text,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 11,
  },
});
