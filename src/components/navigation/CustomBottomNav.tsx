import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Home, Inbox, Search, Folder, Plus } from 'lucide-react-native';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/useTheme';
import { triggerHaptic } from '../../utils/haptics';

export interface BottomTabBarProps {
  state: {
    index: number;
    routes: { name: string; key: string }[];
  };
  descriptors: any;
  navigation: {
    navigate: (name: string) => void;
  };
}

interface NavTabItemProps {
  label: string;
  routeName: string;
  isActive: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  badge?: boolean;
}

const NavTabItem: React.FC<NavTabItemProps> = ({
  label,
  isActive,
  onPress,
  icon,
  activeIcon,
  badge,
}) => {
  const { isDark, accent, themeColors } = useTheme();

  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(activeAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.88,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const activePillBg = isDark ? `${accent.primary}35` : accent.light;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.tabItem}
    >
      <View style={styles.tabPill}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tabPillBg,
            {
              backgroundColor: activePillBg,
              opacity: activeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <View style={styles.tabIconWrapper} pointerEvents="none">
          {isActive ? activeIcon : icon}
        </View>
        {badge && <View style={styles.redDot} />}
      </View>

      <Text
        style={[
          TYPOGRAPHY.caption,
          styles.tabLabel,
          {
            color: isActive ? (isDark ? accent.primary : accent.deep) : themeColors.textMuted,
            fontWeight: isActive ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const CustomBottomNav: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const openAddModal = useUiStore((s) => s.openAddModal);
  const { isDark, accent, themeColors } = useTheme();

  const currentRouteName = state.routes[state.index].name;

  const handleTabPress = (route: string) => {
    triggerHaptic('light');
    navigation.navigate(route);
  };

  const handleFabPress = () => {
    triggerHaptic('medium');
    openAddModal();
  };

  const activeColor = isDark ? accent.primary : accent.deep;
  const inactiveColor = themeColors.textSecondary;

  return (
    <View style={styles.navContainer} pointerEvents="box-none">
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
          SHADOWS.cardElevated,
        ]}
      >
        <NavTabItem
          label="Home"
          routeName="index"
          isActive={currentRouteName === 'index'}
          onPress={() => handleTabPress('index')}
          icon={<Home size={20} color={inactiveColor} />}
          activeIcon={<Home size={20} color={activeColor} strokeWidth={2.4} />}
        />

        <NavTabItem
          label="Inbox"
          routeName="inbox"
          isActive={currentRouteName === 'inbox'}
          onPress={() => handleTabPress('inbox')}
          icon={<Inbox size={20} color={inactiveColor} />}
          activeIcon={<Inbox size={20} color={activeColor} strokeWidth={2.4} />}
          badge={true}
        />

        <View style={styles.fabContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFabPress}
            style={[styles.fabButton, { backgroundColor: accent.primary }, SHADOWS.fab]}
          >
            <Plus size={26} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <NavTabItem
          label="Find"
          routeName="find"
          isActive={currentRouteName === 'find'}
          onPress={() => handleTabPress('find')}
          icon={<Search size={20} color={inactiveColor} />}
          activeIcon={<Search size={20} color={activeColor} strokeWidth={2.4} />}
        />

        <NavTabItem
          label="Library"
          routeName="library"
          isActive={currentRouteName === 'library'}
          onPress={() => handleTabPress('library')}
          icon={<Folder size={20} color={inactiveColor} />}
          activeIcon={<Folder size={20} color={activeColor} strokeWidth={2.4} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.sm,
    backgroundColor: 'transparent',
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    paddingHorizontal: SPACING.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  tabPillBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    zIndex: 0,
  },
  tabIconWrapper: {
    zIndex: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    position: 'absolute',
    top: 5,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    zIndex: 3,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  fabContainer: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    top: -10,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
