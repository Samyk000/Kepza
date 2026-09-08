import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  Folder,
  Cpu,
  Plane,
  Sparkles,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Heart,
  MoreHorizontal,
  ChevronRight,
  MoreVertical,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
} from 'lucide-react-native';
import { Collection } from '../../types/collection';
import { ACCENT_PALETTES } from '../../theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { deleteCollection } from '../../db/queries/collections';

interface CollectionCardProps {
  collection: Collection;
  variant?: 'grid' | 'carousel' | 'list';
  onMenuPress?: () => void;
  onDeleted?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  variant = 'grid',
  onMenuPress,
  onDeleted,
  style,
}) => {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const showToast = useUiStore((s) => s.showToast);
  const openAddModal = useUiStore((s) => s.openAddModal);
  const [showMenu, setShowMenu] = useState(false);

  const palette =
    ACCENT_PALETTES[collection.color] || ACCENT_PALETTES.yellow;

  const isSystem = ['col-all', 'col-unread', 'col-starred', 'col-archive'].includes(collection.id);

  const handlePress = () => {
    router.push({
      pathname: '/collection/[id]',
      params: { id: collection.id },
    });
  };

  const handleTriggerMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (onMenuPress) {
      onMenuPress();
    } else {
      setShowMenu(true);
    }
  };

  const renderIcon = () => {
    const iconColor = isDark ? palette.text : '#0F172A';
    const size = 22;

    switch (collection.icon) {
      case 'cpu':
        return <Cpu size={size} color={iconColor} />;
      case 'plane':
        return <Plane size={size} color={iconColor} />;
      case 'sparkles':
        return <Sparkles size={size} color={iconColor} />;
      case 'lightbulb':
        return <Lightbulb size={size} color={iconColor} />;
      case 'graduation-cap':
        return <GraduationCap size={size} color={iconColor} />;
      case 'briefcase':
        return <Briefcase size={size} color={iconColor} />;
      case 'heart':
        return <Heart size={size} color={iconColor} />;
      case 'more-horizontal':
        return <MoreHorizontal size={size} color={iconColor} />;
      case 'folder':
      default:
        return <Folder size={size} color={iconColor} />;
    }
  };

  const renderActionModal = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
        style={styles.modalBackdrop}
      >
        <View
          style={[
            styles.actionSheet,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : palette.border,
            },
            SHADOWS.cardElevated,
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />

          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIconBox, { backgroundColor: isDark ? '#334155' : palette.light }]}>
              {renderIcon()}
            </View>
            <View style={styles.sheetHeaderText}>
              <Text numberOfLines={1} style={[TYPOGRAPHY.subhead, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                {collection.name}
              </Text>
              <Text numberOfLines={1} style={[TYPOGRAPHY.caption, { color: isDark ? '#94A3B8' : palette.text }]}>
                {collection.itemCount || 0} items
              </Text>
            </View>
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={() => {
              setShowMenu(false);
              handlePress();
            }}
          >
            <FolderOpen size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
            <Text style={[styles.sheetItemText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Open Collection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={() => {
              setShowMenu(false);
              openAddModal();
            }}
          >
            <Plus size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
            <Text style={[styles.sheetItemText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Add Link to Collection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={async () => {
              setShowMenu(false);
              await Clipboard.setStringAsync(collection.name);
              showToast('Collection name copied', 'info');
            }}
          >
            <Copy size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
            <Text style={[styles.sheetItemText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Copy Name
            </Text>
          </TouchableOpacity>

          {!isSystem && (
            <>
              <View style={[styles.sheetDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
              <TouchableOpacity
                style={styles.sheetItem}
                activeOpacity={0.7}
                onPress={async () => {
                  setShowMenu(false);
                  await deleteCollection(collection.id);
                  showToast('Collection deleted', 'info');
                  onDeleted?.();
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.sheetItemText, { color: '#EF4444' }]}>
                  Delete Collection
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (variant === 'list') {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          onLongPress={handleTriggerMenu}
          delayLongPress={300}
          style={[
            styles.card,
            styles.listCard,
            {
              backgroundColor: isDark ? '#1E293B' : palette.light,
              borderColor: isDark ? '#334155' : palette.border,
            },
            SHADOWS.card,
            style,
          ]}
        >
          <View style={styles.listLeftRow}>
            <View
              style={[
                styles.listIconBox,
                { backgroundColor: isDark ? '#334155' : 'rgba(255, 255, 255, 0.7)' },
              ]}
            >
              {renderIcon()}
            </View>
            <View style={styles.listTextCol}>
              <Text
                numberOfLines={1}
                style={[
                  TYPOGRAPHY.subhead,
                  styles.listName,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                {collection.name}
              </Text>
              <Text
                style={[
                  TYPOGRAPHY.caption,
                  styles.listItemCount,
                  { color: isDark ? '#94A3B8' : palette.text },
                ]}
              >
                {collection.itemCount || 0} items
              </Text>
            </View>
          </View>

          <View style={styles.listRightRow}>
            <TouchableOpacity
              onPress={handleTriggerMenu}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.menuButton}
            >
              <MoreVertical size={16} color={palette.text} />
            </TouchableOpacity>
            <View
              style={[
                styles.chevronCircle,
                {
                  backgroundColor: isDark ? '#334155' : 'rgba(255, 255, 255, 0.7)',
                },
              ]}
            >
              <ChevronRight size={14} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </View>
          </View>
        </TouchableOpacity>
        {renderActionModal()}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        onLongPress={handleTriggerMenu}
        delayLongPress={300}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1E293B' : palette.light,
            borderColor: isDark ? '#334155' : palette.border,
          },
          variant === 'carousel' ? styles.carouselCard : styles.gridCard,
          SHADOWS.card,
          style,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>{renderIcon()}</View>
          <TouchableOpacity
            onPress={handleTriggerMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.menuButton}
          >
            <MoreVertical size={16} color={palette.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.textContainer}>
            <Text
              numberOfLines={1}
              style={[
                TYPOGRAPHY.subhead,
                styles.name,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}
            >
              {collection.name}
            </Text>
            <Text
              style={[
                TYPOGRAPHY.caption,
                styles.itemCount,
                { color: isDark ? '#94A3B8' : palette.text },
              ]}
            >
              {collection.itemCount || 0} items
            </Text>
          </View>

          <View
            style={[
              styles.chevronCircle,
              {
                backgroundColor: isDark ? '#334155' : 'rgba(255, 255, 255, 0.7)',
              },
            ]}
          >
            <ChevronRight
              size={14}
              color={isDark ? '#F8FAFC' : '#0F172A'}
            />
          </View>
        </View>
      </TouchableOpacity>
      {renderActionModal()}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    minHeight: 110,
    margin: SPACING.xs,
  },
  carouselCard: {
    width: 140,
    height: 115,
    marginRight: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 2,
  },
  menuButton: {
    padding: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  name: {
    fontWeight: '700',
    fontSize: 13,
  },
  itemCount: {
    marginTop: 2,
    fontWeight: '600',
    opacity: 0.85,
  },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sheetIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetDivider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  listCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  listLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  listIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextCol: {
    flex: 1,
  },
  listName: {
    fontWeight: '700',
    fontSize: 14,
  },
  listItemCount: {
    marginTop: 2,
    fontWeight: '600',
    opacity: 0.85,
  },
  listRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});
