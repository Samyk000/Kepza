import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  Modal,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import {
  Link as LinkIcon,
  MoreVertical,
  FileText,
  Video,
  Globe,
  Code,
  Share2,
  Clock,
  Copy,
  ExternalLink,
  Star,
  Trash2,
  RotateCcw,
  Edit2,
} from 'lucide-react-native';
import { Link } from '../../types/link';
import { COLORS, ACCENT_PALETTES } from '../../theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { deleteLink, updateLink } from '../../db/queries/links';
import { TagChip } from '../ui/TagChip';
import { useTheme } from '../../theme/useTheme';
import { triggerHaptic } from '../../utils/haptics';

interface LinkCardProps {
  link: Link;
  variant?: 'horizontal' | 'compact';
  onMenuPress?: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  variant = 'horizontal',
  onMenuPress,
  onDeleted,
  onUpdated,
  style,
}) => {
  const router = useRouter();
  const { isDark, accent, themeColors } = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPinned, setIsPinned] = useState(link.isPinned || false);

  const handlePress = () => {
    router.push({
      pathname: '/link/[id]',
      params: { id: link.id },
    });
  };

  const handleTriggerMenu = () => {
    triggerHaptic('medium');
    if (onMenuPress) {
      onMenuPress();
    } else {
      setShowMenu(true);
    }
  };

  const renderTypeIcon = () => {
    switch (link.contentType) {
      case 'video':
        return <Video size={13} color="#EF4444" />;
      case 'article':
        return <FileText size={13} color="#3B82F6" />;
      case 'code':
        return <Code size={13} color="#0F172A" />;
      case 'social':
        return <Share2 size={13} color="#EC4899" />;
      case 'website':
      default:
        return <Globe size={13} color="#10B981" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
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
              borderColor: themeColors.border,
            },
            SHADOWS.cardElevated,
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />

          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIconBox, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              {renderTypeIcon()}
            </View>
            <View style={styles.sheetHeaderText}>
              <Text numberOfLines={1} style={[TYPOGRAPHY.subhead, { color: themeColors.text }]}>
                {link.title}
              </Text>
              <Text numberOfLines={1} style={[TYPOGRAPHY.caption, { color: themeColors.textSecondary }]}>
                {link.domain}
              </Text>
            </View>
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: themeColors.borderLight }]} />

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={async () => {
              setShowMenu(false);
              await Clipboard.setStringAsync(link.url);
              showToast('Link copied to clipboard', 'info');
            }}
          >
            <Copy size={18} color={themeColors.text} />
            <Text style={[styles.sheetItemText, { color: themeColors.text }]}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={async () => {
              setShowMenu(false);
              await WebBrowser.openBrowserAsync(link.url);
            }}
          >
            <ExternalLink size={18} color={themeColors.text} />
            <Text style={[styles.sheetItemText, { color: themeColors.text }]}>Open in Browser</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={() => {
              setShowMenu(false);
              router.push('/link/' + link.id);
            }}
          >
            <Edit2 size={18} color={themeColors.text} />
            <Text style={[styles.sheetItemText, { color: themeColors.text }]}>Edit Link & Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={async () => {
              setShowMenu(false);
              const newPinned = !isPinned;
              setIsPinned(newPinned);
              await updateLink(link.id, { isPinned: newPinned });
              showToast(newPinned ? 'Pinned to top' : 'Unpinned', 'info');
              onUpdated?.();
            }}
          >
            <Star
              size={18}
              color={isPinned ? '#EAB308' : themeColors.text}
              fill={isPinned ? '#EAB308' : 'transparent'}
            />
            <Text style={[styles.sheetItemText, { color: themeColors.text }]}>
              {isPinned ? 'Unpin Link' : 'Pin Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={async () => {
              setShowMenu(false);
              try {
                await Share.share({
                  url: link.url,
                  message: link.url,
                  title: link.title,
                });
              } catch {}
            }}
          >
            <Share2 size={18} color={themeColors.text} />
            <Text style={[styles.sheetItemText, { color: themeColors.text }]}>Share Link</Text>
          </TouchableOpacity>

          <View style={[styles.sheetDivider, { backgroundColor: themeColors.borderLight }]} />

          {link.status === 'trash' ? (
            <>
              <TouchableOpacity
                style={styles.sheetItem}
                activeOpacity={0.7}
                onPress={async () => {
                  setShowMenu(false);
                  await updateLink(link.id, { status: 'inbox' });
                  showToast('Link restored to Inbox ✓', 'success');
                  onDeleted?.();
                  onUpdated?.();
                }}
              >
                <RotateCcw size={18} color="#059669" />
                <Text style={[styles.sheetItemText, { color: '#059669', fontWeight: '600' }]}>
                  Restore to Inbox
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                activeOpacity={0.7}
                onPress={async () => {
                  setShowMenu(false);
                  await deleteLink(link.id, true);
                  showToast('Link permanently deleted', 'info');
                  onDeleted?.();
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.sheetItemText, { color: '#EF4444', fontWeight: '600' }]}>
                  Delete Permanently
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.sheetItem}
              activeOpacity={0.7}
              onPress={async () => {
                setShowMenu(false);
                await deleteLink(link.id, false);
                showToast('Link moved to trash', 'info');
                onDeleted?.();
              }}
            >
              <Trash2 size={18} color="#EF4444" />
              <Text style={[styles.sheetItemText, { color: '#EF4444' }]}>Move to Trash</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (variant === 'compact') {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handlePress}
          onLongPress={handleTriggerMenu}
          delayLongPress={300}
          style={[
            styles.compactCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
            SHADOWS.card,
            style,
          ]}
        >
          <View style={styles.compactImageContainer}>
            {link.thumbnail && !imageError ? (
              <Image
                source={{ uri: link.thumbnail }}
                style={styles.compactImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={[
                  styles.compactPlaceholder,
                  { backgroundColor: themeColors.cardSecondary },
                ]}
              >
                <LinkIcon size={24} color={themeColors.textSecondary} />
              </View>
            )}

            <View style={styles.floatingBadge}>
              {renderTypeIcon()}
              <Text style={[styles.floatingBadgeText, { color: '#0F172A' }]}>
                {link.source || capitalize(link.contentType)}
              </Text>
            </View>
          </View>

          <View style={styles.compactDetails}>
            <View style={styles.compactTitleRow}>
              <Text
                numberOfLines={2}
                style={[
                  TYPOGRAPHY.subhead,
                  styles.compactTitle,
                  { color: themeColors.text },
                ]}
              >
                {link.title}
              </Text>
              <TouchableOpacity
                onPress={handleTriggerMenu}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreVertical size={16} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.savedAgoRow}>
              <Clock size={12} color={themeColors.textMuted} />
              <Text style={[styles.savedAgoText, { color: themeColors.textSecondary }]}>
                Saved {getTimeAgo(link.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {renderActionModal()}
      </>
    );
  }

  // Horizontal variant (default)
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        onLongPress={handleTriggerMenu}
        delayLongPress={300}
        style={[
          styles.horizontalCard,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
          SHADOWS.card,
          style,
        ]}
      >
        <View style={styles.thumbContainer}>
          {link.thumbnail && !imageError ? (
            <Image
              source={{ uri: link.thumbnail }}
              style={styles.thumbnail}
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={[
                styles.thumbPlaceholder,
                { backgroundColor: themeColors.cardSecondary },
              ]}
            >
              <LinkIcon size={22} color={themeColors.textSecondary} />
            </View>
          )}

          <View style={styles.typeBadgeFloating}>
            {renderTypeIcon()}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text
              numberOfLines={1}
              style={[
                TYPOGRAPHY.subhead,
                styles.title,
                { color: themeColors.text },
              ]}
            >
              {link.title}
            </Text>
            <View style={styles.topRightMeta}>
              <Text style={[styles.timeAgo, { color: themeColors.textMuted }]}>
                {getTimeAgo(link.createdAt)}
              </Text>
              <TouchableOpacity
                onPress={handleTriggerMenu}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.menuIcon}
              >
                <MoreVertical size={16} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {link.description ? (
            <Text
              numberOfLines={2}
              style={[styles.description, { color: themeColors.textSecondary }]}
            >
              {link.description}
            </Text>
          ) : null}

          <View style={styles.bottomRow}>
            <View style={styles.domainWrapper}>
              <LinkIcon size={12} color={themeColors.textMuted} />
              <Text style={[styles.domainText, { color: themeColors.textSecondary }]}>
                {link.domain}
              </Text>
            </View>

            {link.source && (
              <TagChip
                label={link.source}
                color={getCollectionColor(link.source)}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
      {renderActionModal()}
    </>
  );
};

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCollectionColor(source: string) {
  const s = source.toLowerCase();
  if (s.includes('travel')) return 'pink';
  if (s.includes('ai') || s.includes('tech')) return 'mint';
  if (s.includes('inspiration')) return 'lavender';
  if (s.includes('motivation')) return 'pink';
  if (s.includes('productiv')) return 'yellow';
  return 'blue';
}

const styles = StyleSheet.create({
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  thumbContainer: {
    position: 'relative',
    width: 104,
    height: 84,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeFloating: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  topRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 11,
    marginRight: 4,
  },
  menuIcon: {
    padding: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  domainWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Compact card styles
  compactCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  compactImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  floatingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  compactDetails: {
    padding: SPACING.md,
  },
  compactTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  compactTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
    marginRight: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedAgoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  savedAgoText: {
    fontSize: 11,
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
});
