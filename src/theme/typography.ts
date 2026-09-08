import { TextStyle } from 'react-native';

export const TYPOGRAPHY: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  title1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  title2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  title3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  subhead: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};
