import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  FileText,
  Video,
  Globe,
  Share2,
  Image as ImageIcon,
  SlidersHorizontal,
  Lightbulb,
  ArrowRight,
  Inbox as InboxIcon,
} from 'lucide-react-native';
import { HeaderBar } from '../../src/components/ui/HeaderBar';
import { FilterChip } from '../../src/components/ui/FilterChip';
import { LinkCard } from '../../src/components/links/LinkCard';
import { getAllLinks, updateLink, deleteLink } from '../../src/db/queries/links';
import { Link, ContentType } from '../../src/types/link';
import { COLORS, ACCENT_PALETTES } from '../../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUiStore } from '../../src/store/uiStore';

export default function InboxScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const showToast = useUiStore((s) => s.showToast);
  const lastLinkSavedAt = useUiStore((s) => s.lastLinkSavedAt);

  const [links, setLinks] = useState<Link[]>([]);
  const [activeFilter, setActiveFilter] = useState<ContentType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadInboxLinks = useCallback(async () => {
    try {
      const result = await getAllLinks({
        status: 'inbox',
        contentType: activeFilter,
      });
      setLinks(result);
    } catch (e) {
      console.warn('Error loading inbox links:', e);
    }
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadInboxLinks();
    }, [loadInboxLinks])
  );

  useEffect(() => {
    if (lastLinkSavedAt > 0) {
      loadInboxLinks();
    }
  }, [lastLinkSavedAt, loadInboxLinks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInboxLinks();
    setRefreshing(false);
  };

  const handleMenuPress = (link: Link) => {
    const options = ['Organize into Collection', 'Mark as Archived', 'Delete Link', 'Cancel'];
    const destructiveIndex = 2;
    const cancelIndex = 3;

    const handleAction = async (buttonIndex: number) => {
      if (buttonIndex === 0) {
        // Navigate to link detail to organize
        router.push({
          pathname: '/link/[id]',
          params: { id: link.id },
        });
      } else if (buttonIndex === 1) {
        await updateLink(link.id, { status: 'archived' });
        showToast('Archived link', 'info');
        loadInboxLinks();
      } else if (buttonIndex === 2) {
        await deleteLink(link.id);
        showToast('Moved to Trash', 'info');
        loadInboxLinks();
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: destructiveIndex, cancelButtonIndex: cancelIndex },
        handleAction
      );
    } else {
      Alert.alert(
        link.title,
        'Choose action',
        [
          { text: 'Organize', onPress: () => handleAction(0) },
          { text: 'Archive', onPress: () => handleAction(1) },
          { text: 'Delete', onPress: () => handleAction(2), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const filterOptions: { id: ContentType | 'all'; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All' },
    { id: 'article', label: 'Articles', icon: <FileText size={14} color={activeFilter === 'article' ? '#FFF' : '#3B82F6'} /> },
    { id: 'video', label: 'Videos', icon: <Video size={14} color={activeFilter === 'video' ? '#FFF' : '#EF4444'} /> },
    { id: 'website', label: 'Websites', icon: <Globe size={14} color={activeFilter === 'website' ? '#FFF' : '#10B981'} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={14} color={activeFilter === 'social' ? '#FFF' : '#EC4899'} /> },
    { id: 'image', label: 'Images', icon: <ImageIcon size={14} color={activeFilter === 'image' ? '#FFF' : '#8B5CF6'} /> },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'left', 'right']}
    >
      <HeaderBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
        }
      >
        {/* Title Header with Counter and Graphic */}
        <View style={styles.titleContainer}>
          <View style={styles.titleCol}>
            <View style={styles.titleRow}>
              <Text style={[TYPOGRAPHY.display, styles.titleText, { color: themeColors.text }]}>
                Inbox
              </Text>
              <View style={[styles.countBadge, { backgroundColor: ACCENT_PALETTES.mint.light }]}>
                <Text style={[styles.countBadgeText, { color: ACCENT_PALETTES.mint.deep }]}>
                  {links.length}
                </Text>
              </View>
            </View>
            <Text style={[TYPOGRAPHY.body, styles.subtitleText, { color: themeColors.textSecondary }]}>
              Your recently saved links.{'\n'}Organize when you're ready.
            </Text>
          </View>

          {/* Hand-drawn style illustration box */}
          <View style={styles.illustrationWrapper}>
            <View style={styles.inboxBoxGraphic}>
              <InboxIcon size={24} color="#059669" />
            </View>
            <Text style={[styles.sortLaterText, { color: themeColors.textSecondary }]}>
              Save now.{'\n'}Sort later. ⤵
            </Text>
          </View>
        </View>

        {/* Filter Chips Horizontal Scroll */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                label={opt.label}
                icon={opt.icon}
                selected={activeFilter === opt.id}
                onPress={() => setActiveFilter(opt.id)}
              />
            ))}
            <TouchableOpacity
              style={[
                styles.sortIconBtn,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <SlidersHorizontal size={16} color={themeColors.text} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Links List */}
        <View style={styles.listContainer}>
          {links.length > 0 ? (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                variant="horizontal"
                onDeleted={() => {
                  setLinks((prev) => prev.filter((l) => l.id !== link.id));
                  loadInboxLinks();
                }}
                onUpdated={loadInboxLinks}
              />
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: themeColors.cardSecondary }]}>
              <InboxIcon size={36} color={themeColors.textMuted} />
              <Text style={[TYPOGRAPHY.title3, styles.emptyTitle, { color: themeColors.text }]}>
                Your Inbox is all caught up
              </Text>
              <Text style={[TYPOGRAPHY.body, styles.emptyDesc, { color: themeColors.textSecondary }]}>
                Share links from any app or tap the + button below to save content.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Callout Banner */}
        {links.length > 0 && (
          <View
            style={[
              styles.calloutCard,
              {
                backgroundColor: isDark ? '#1E293B' : ACCENT_PALETTES.lavender.light,
                borderColor: isDark ? '#334155' : ACCENT_PALETTES.lavender.border,
              },
              SHADOWS.card,
            ]}
          >
            <View style={styles.calloutLeft}>
              <View style={styles.bulbCircle}>
                <Lightbulb size={20} color="#D97706" />
              </View>
              <View style={styles.calloutTextCol}>
                <Text style={[TYPOGRAPHY.subhead, styles.calloutTitle, { color: isDark ? '#F8FAFC' : '#1E1B4B' }]}>
                  {links.length} new saves waiting for you.
                </Text>
                <Text style={[TYPOGRAPHY.footnote, { color: isDark ? '#94A3B8' : '#5B21B6' }]}>
                  Take a moment to review or add notes.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (links[0]) {
                  router.push({
                    pathname: '/link/[id]',
                    params: { id: links[0].id },
                  });
                }
              }}
              style={[styles.organizeBtn, { backgroundColor: '#0F172A' }]}
            >
              <Text style={styles.organizeBtnText}>Organize Now</Text>
              <ArrowRight size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    letterSpacing: -0.8,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitleText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 90,
    height: 70,
  },
  inboxBoxGraphic: {
    width: 46,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sortLaterText: {
    fontSize: 9,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  filterBar: {
    marginVertical: SPACING.md,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  sortIconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
  },
  emptyBox: {
    padding: SPACING.xxxl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  calloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  calloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  bulbCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  calloutTextCol: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  organizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    borderRadius: RADIUS.full,
  },
  organizeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
