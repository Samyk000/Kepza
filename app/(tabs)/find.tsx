import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Clock,
  Trash2,
  FileText,
  Video,
  Globe,
  Code,
  Share2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react-native';
import { HeaderBar } from '../../src/components/ui/HeaderBar';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { FilterChip } from '../../src/components/ui/FilterChip';
import { LinkCard } from '../../src/components/links/LinkCard';
import {
  searchLinks,
  getRecentSearches,
  addSearchQuery,
  clearSearchHistory,
} from '../../src/db/queries/search';
import { Link, ContentType } from '../../src/types/link';
import { COLORS, ACCENT_PALETTES } from '../../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUiStore } from '../../src/store/uiStore';

export default function FindScreen() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const [activeFilter, setActiveFilter] = useState<ContentType | 'all'>('all');
  const [results, setResults] = useState<Link[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const loadRecentSearches = useCallback(async () => {
    try {
      const history = await getRecentSearches();
      setRecentSearches(history);
    } catch (e) {
      console.warn('Error loading recent searches:', e);
    }
  }, []);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const found = await searchLinks(searchQuery, activeFilter);
        setResults(found);
        setHasSearched(true);
        addSearchQuery(searchQuery).then(loadRecentSearches);
      } catch (e) {
        console.warn('Search query error:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, loadRecentSearches]);

  const filterOptions: { id: ContentType | 'all'; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All' },
    { id: 'article', label: 'Articles', icon: <FileText size={14} color={activeFilter === 'article' ? '#FFF' : '#3B82F6'} /> },
    { id: 'video', label: 'Videos', icon: <Video size={14} color={activeFilter === 'video' ? '#FFF' : '#EF4444'} /> },
    { id: 'website', label: 'Websites', icon: <Globe size={14} color={activeFilter === 'website' ? '#FFF' : '#10B981'} /> },
    { id: 'code', label: 'GitHub', icon: <Code size={14} color={activeFilter === 'code' ? '#FFF' : '#0F172A'} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={14} color={activeFilter === 'social' ? '#FFF' : '#EC4899'} /> },
    { id: 'image', label: 'Images', icon: <ImageIcon size={14} color={activeFilter === 'image' ? '#FFF' : '#8B5CF6'} /> },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'left', 'right']}
    >
      <HeaderBar showSearch={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[TYPOGRAPHY.display, { color: themeColors.text }]}>
            Find
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, marginTop: 2 }]}>
            Search anything you've saved without remembering where.
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search titles, notes, URLs, tags..."
          autoFocus={false}
          style={styles.searchBar}
        />

        {/* Filter Chips */}
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
          </ScrollView>
        </View>

        {/* When not searching: Show Recent Searches */}
        {!searchQuery.trim() && (
          <View style={styles.emptySearchContainer}>
            {recentSearches.length > 0 && (
              <View style={styles.recentBlock}>
                <View style={styles.recentHeader}>
                  <View style={styles.recentTitleRow}>
                    <Clock size={16} color={themeColors.textSecondary} />
                    <Text style={[TYPOGRAPHY.title3, { color: themeColors.text, marginLeft: SPACING.xs }]}>
                      Recent Searches
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      await clearSearchHistory();
                      setRecentSearches([]);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[TYPOGRAPHY.footnote, { color: themeColors.danger, fontWeight: '600' }]}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentPillsWrap}>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSearchQuery(term)}
                      style={[
                        styles.recentPill,
                        {
                          backgroundColor: themeColors.card,
                          borderColor: themeColors.border,
                        },
                        SHADOWS.subtle,
                      ]}
                    >
                      <Text style={[TYPOGRAPHY.subhead, { color: themeColors.text }]}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Suggested Searches */}
            <View style={styles.suggestedBlock}>
              <View style={styles.recentTitleRow}>
                <Sparkles size={16} color="#D97706" />
                <Text style={[TYPOGRAPHY.title3, { color: themeColors.text, marginLeft: SPACING.xs }]}>
                  Popular Suggestions
                </Text>
              </View>
              <View style={styles.recentPillsWrap}>
                {['AI Agent architecture', 'Switzerland travel', 'Desk setup', 'Local LLMs', 'Notion templates'].map(
                  (suggestion, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSearchQuery(suggestion)}
                      style={[
                        styles.suggestionPill,
                        {
                          backgroundColor: ACCENT_PALETTES.yellow.light,
                          borderColor: ACCENT_PALETTES.yellow.border,
                        },
                      ]}
                    >
                      <Text style={[styles.suggestionText, { color: ACCENT_PALETTES.yellow.text }]}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={[TYPOGRAPHY.subhead, { color: themeColors.textSecondary }]}>
                {results.length} result{results.length === 1 ? '' : 's'} for "{searchQuery}"
              </Text>
            </View>

            {results.length > 0 ? (
              results.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  variant="horizontal"
                  onDeleted={() => {
                    setResults((prev) => prev.filter((l) => l.id !== link.id));
                  }}
                  onUpdated={() => {
                    searchLinks(searchQuery, activeFilter).then(setResults);
                  }}
                />
              ))
            ) : hasSearched ? (
              <View style={[styles.noResultsBox, { backgroundColor: themeColors.cardSecondary }]}>
                <Search size={36} color={themeColors.textMuted} />
                <Text style={[TYPOGRAPHY.title3, styles.noResultsTitle, { color: themeColors.text }]}>
                  Nothing found
                </Text>
                <Text style={[TYPOGRAPHY.body, styles.noResultsDesc, { color: themeColors.textSecondary }]}>
                  We couldn't find matches for "{searchQuery}". Try different keywords or search within a specific collection.
                </Text>
              </View>
            ) : null}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  searchBar: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  filterBar: {
    marginBottom: SPACING.md,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
  },
  emptySearchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    gap: SPACING.xl,
  },
  recentBlock: {},
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  recentPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  suggestedBlock: {},
  suggestionPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  resultsHeader: {
    marginBottom: SPACING.md,
  },
  noResultsBox: {
    padding: SPACING.xxxl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  noResultsTitle: {
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  noResultsDesc: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
