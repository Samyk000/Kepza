import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Star,
  FileText,
  Video,
  Pin,
  Plus,
} from 'lucide-react-native';
import { HeaderBar } from '../../src/components/ui/HeaderBar';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { LinkCard } from '../../src/components/links/LinkCard';
import { HomeArtisticHero } from '../../src/components/home/HomeArtisticHero';
import { getAllLinks } from '../../src/db/queries/links';
import { Link } from '../../src/types/link';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';
import { useUiStore } from '../../src/store/uiStore';
import { triggerHaptic } from '../../src/utils/haptics';

type FilterType = 'all' | 'pinned' | 'article' | 'video' | 'inbox';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, accent, themeColors } = useTheme();
  const openAddModal = useUiStore((s) => s.openAddModal);
  const lastLinkSavedAt = useUiStore((s) => s.lastLinkSavedAt);

  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const all = await getAllLinks();
      setLinks(all);
    } catch (e) {
      console.warn('Error loading home links:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Reactive instant reload when a link is saved anywhere
  useEffect(() => {
    if (lastLinkSavedAt > 0) {
      loadData();
    }
  }, [lastLinkSavedAt, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter and search logic
  const filteredLinks = useMemo(() => {
    let result = links;

    // Filter chip
    if (activeFilter === 'pinned') {
      result = result.filter((l) => l.isPinned);
    } else if (activeFilter === 'article') {
      result = result.filter((l) => l.contentType === 'article');
    } else if (activeFilter === 'video') {
      result = result.filter((l) => l.contentType === 'video');
    } else if (activeFilter === 'inbox') {
      result = result.filter((l) => l.status === 'inbox');
    }

    // In-place search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.domain && l.domain.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.note && l.note.toLowerCase().includes(q))
      );
    }

    return result;
  }, [links, activeFilter, searchQuery]);

  const toggleViewMode = () => {
    triggerHaptic('light');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  };

  const filterTabs: { id: FilterType; label: string; icon?: any }[] = [
    { id: 'all', label: `All (${links.length})` },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'inbox', label: 'Inbox', icon: Sparkles },
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.primary} />
        }
      >
        {/* Artistic SVG Visual Banner */}
        <HomeArtisticHero />

        {/* In-Place Real-Time Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your saved links..."
          style={styles.searchBar}
        />

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('light');
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setActiveFilter(tab.id);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? (isDark ? accent.primary : '#0F172A')
                      : themeColors.cardSecondary,
                    borderColor: isActive
                      ? (isDark ? accent.primary : '#0F172A')
                      : themeColors.border,
                  },
                ]}
              >
                {Icon && (
                  <Icon
                    size={14}
                    color={isActive ? (isDark ? '#0F172A' : '#FFFFFF') : themeColors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive
                        ? (isDark ? '#0F172A' : '#FFFFFF')
                        : themeColors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header: Link count & View Toggle */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[TYPOGRAPHY.title2, { color: themeColors.text }]}>
              {searchQuery.trim() ? `Search Results` : 'All Links'}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: themeColors.cardSecondary }]}>
              <Text style={[styles.countBadgeText, { color: themeColors.textSecondary }]}>
                {filteredLinks.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={toggleViewMode}
            style={[styles.viewToggleBtn, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.border }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {viewMode === 'list' ? (
              <LayoutGrid size={18} color={themeColors.text} />
            ) : (
              <ListIcon size={18} color={themeColors.text} />
            )}
          </TouchableOpacity>
        </View>

        {/* Links Grid/List Container */}
        {filteredLinks.length > 0 ? (
          <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
            {filteredLinks.map((item) => (
              <LinkCard
                key={item.id}
                link={item}
                variant={viewMode === 'grid' ? 'compact' : 'horizontal'}
                style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
                onDeleted={loadData}
                onUpdated={loadData}
              />
            ))}
          </View>
        ) : (
          /* Clean Empty State */
          <View style={[styles.emptyCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? `${accent.primary}20` : accent.light }]}>
              <Sparkles size={28} color={isDark ? accent.primary : '#0F172A'} />
            </View>
            <Text style={[TYPOGRAPHY.title3, { color: themeColors.text, marginTop: 14 }]}>
              {searchQuery.trim() ? 'No matching links found' : 'No links saved yet'}
            </Text>
            <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }]}>
              {searchQuery.trim()
                ? `No results matching "${searchQuery}". Try a different keyword.`
                : 'Tap the + button to save your first link, article, or video.'}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openAddModal()}
                style={[styles.emptyAddBtn, { backgroundColor: isDark ? '#FFFFFF' : '#0F172A' }]}
              >
                <Plus size={16} color={isDark ? '#0F172A' : '#FFFFFF'} style={{ marginRight: 6 }} />
                <Text style={[styles.emptyAddBtnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  Save a Link
                </Text>
              </TouchableOpacity>
            )}
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
    paddingBottom: 110,
  },
  heroContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  heroTitle: {
    letterSpacing: -0.8,
  },
  heroHighlight: {
    borderRadius: 6,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  heroSubtitle: {
    marginTop: SPACING.xs,
    fontSize: 14,
  },
  searchBar: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  listItem: {
    marginBottom: SPACING.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    rowGap: SPACING.md,
  },
  gridItem: {
    width: '48.5%',
  },
  emptyCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
  },
  emptyAddBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
