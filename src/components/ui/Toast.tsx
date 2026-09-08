import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useUiStore } from '../../store/uiStore';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';

export const Toast: React.FC = () => {
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle size={18} color="#EF4444" />;
      case 'info':
        return <Info size={18} color="#3B82F6" />;
      case 'success':
      default:
        return <CheckCircle size={18} color="#10B981" />;
    }
  };

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      <View style={[styles.toastCard, SHADOWS.cardHover]}>
        <View style={styles.iconWrapper}>{getIcon()}</View>
        <Text style={[TYPOGRAPHY.subhead, styles.toastText]}>{toast.message}</Text>
        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    maxWidth: '90%',
  },
  iconWrapper: {
    marginRight: SPACING.sm,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    flexShrink: 1,
  },
  closeButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
});
