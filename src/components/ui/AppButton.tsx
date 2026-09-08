import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const getButtonStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          button: {
            backgroundColor: themeColors.actionPill,
            borderWidth: 0,
          },
          text: {
            color: themeColors.actionPillText,
          },
        };
      case 'accent':
        return {
          button: {
            backgroundColor: themeColors.fab,
            borderWidth: 0,
          },
          text: {
            color: themeColors.fabIcon,
            fontWeight: '700',
          },
        };
      case 'secondary':
        return {
          button: {
            backgroundColor: themeColors.cardSecondary,
            borderWidth: 1,
            borderColor: themeColors.border,
          },
          text: {
            color: themeColors.text,
          },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: themeColors.border,
          },
          text: {
            color: themeColors.text,
          },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: themeColors.dangerLight,
            borderWidth: 0,
          },
          text: {
            color: themeColors.danger,
            fontWeight: '600',
          },
        };
      case 'ghost':
      default:
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: themeColors.textSecondary,
          },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: {
            paddingVertical: SPACING.xs + 2,
            paddingHorizontal: SPACING.md,
            borderRadius: RADIUS.full,
          },
          text: {
            fontSize: 13,
          },
        };
      case 'lg':
        return {
          button: {
            paddingVertical: SPACING.lg,
            paddingHorizontal: SPACING.xxl,
            borderRadius: RADIUS.full,
          },
          text: {
            fontSize: 17,
            fontWeight: '700',
          },
        };
      case 'md':
      default:
        return {
          button: {
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.xl,
            borderRadius: RADIUS.full,
          },
          text: {
            fontSize: 15,
            fontWeight: '600',
          },
        };
    }
  };

  const variantStyle = getButtonStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        variantStyle.button,
        sizeStyle.button,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text.color || themeColors.text}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              TYPOGRAPHY.bodyMedium,
              styles.baseText,
              variantStyle.text,
              sizeStyle.text,
              leftIcon ? { marginLeft: SPACING.xs + 2 } : null,
              rightIcon ? { marginRight: SPACING.xs + 2 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
