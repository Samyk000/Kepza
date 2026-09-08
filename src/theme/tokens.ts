import { Platform } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const SHADOWS = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
    },
    default: {
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    },
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
    },
  }),
  cardHover: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
    },
  }),
  cardElevated: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
    },
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#D97706',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
    },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: {
      elevation: 10,
    },
    default: {
      boxShadow: '0 -4px 24px rgba(15, 23, 42, 0.12)',
    },
  }),
};
