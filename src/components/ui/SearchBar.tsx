import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  isReadOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  onPress,
  onFilterPress,
  placeholder = 'Search your saved content...',
  autoFocus = false,
  isReadOnly = false,
  style,
}) => {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        },
        SHADOWS.card,
        style,
      ]}
    >
      <Search size={20} color={themeColors.textSecondary} style={styles.searchIcon} />

      {isReadOnly ? (
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              TYPOGRAPHY.body,
              { color: themeColors.textSecondary },
            ]}
            placeholder={placeholder}
            placeholderTextColor={themeColors.textMuted}
            editable={false}
            pointerEvents="none"
          />
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            TYPOGRAPHY.body,
            { color: themeColors.text },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.textMuted}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      )}

      {value.length > 0 && onChangeText && !isReadOnly && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={themeColors.textMuted} />
        </TouchableOpacity>
      )}

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[styles.filterButton, { borderLeftColor: themeColors.borderLight }]}
        >
          <SlidersHorizontal size={18} color={themeColors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isReadOnly && onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  clearButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  filterButton: {
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    borderLeftWidth: 1,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
