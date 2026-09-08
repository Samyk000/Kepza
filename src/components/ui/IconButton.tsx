import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/tokens';
import { useSettingsStore } from '../../store/settingsStore';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'flat' | 'surface' | 'accent' | 'ghost';
  badge?: boolean | number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 40,
  variant = 'surface',
  badge,
  style,
  accessibilityLabel,
}) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const getBgColor = () => {
    switch (variant) {
      case 'surface':
        return themeColors.card;
      case 'accent':
        return themeColors.fab;
      case 'flat':
        return themeColors.cardSecondary;
      case 'ghost':
      default:
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (variant === 'surface' || variant === 'flat') {
      return themeColors.border;
    }
    return 'transparent';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: RADIUS.full,
          backgroundColor: getBgColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'ghost' ? 0 : 1,
        },
        style,
      ]}
    >
      {icon}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: themeColors.danger,
              borderColor: themeColors.card,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
