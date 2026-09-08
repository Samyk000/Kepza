import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Folder,
  Tag as TagIcon,
  Archive,
  Trash2,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  ArrowRight,
  X,
  Check,
} from 'lucide-react-native';
import { HeaderBar } from '../../src/components/ui/HeaderBar';
import { CollectionCard } from '../../src/components/collections/CollectionCard';
import { LinkCard } from '../../src/components/links/LinkCard';
import {
  getCollections,
  createCollection,
} from '../../src/db/queries/collections';
import { getAllLinks } from '../../src/db/queries/links';
import { Collection } from '../../src/types/collection';
import { Link } from '../../src/types/link';
import { COLORS, ACCENT_PALETTES, AccentColor } from '../../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';
import { useUiStore, LibraryTab } from '../../src/store/uiStore';

export default function LibraryScreen() {
  const router = useRouter();
  const { isDark, accent, themeColors } = useTheme();

  const libraryTab = useUiStore((s) => s.libraryTab);
  const setLibraryTab = useUiStore((s) => s.setLibraryTab);
  const libraryLayout = useUiStore((s) => s.libraryLayout);
  const toggleLibraryLayout = useUiStore((s) => s.toggleLibraryLayout);
  const showToast = useUiStore((s) => s.showToast);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [tabLinks, setTabLinks] = useState<Link[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // New Collection Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [selectedColor, setSelectedColor] = useState<AccentColor>('yellow');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  const loadData = useCallback(async () => {
    try {
      const [cols, recent] = await Promise.all([
        getCollections(),
        getAllLinks({ limit: 4 }),
      ]);
      setCollections(cols);
      setRecentLinks(recent);

      if (libraryTab === 'archive') {
        const archived = await getAllLinks({ status: 'archived' });
        setTabLinks(archived);
      } else if (libraryTab === 'trash') {
        const trash = await getAllLinks({ status: 'trash' });
        setTabLinks(trash);
      }
    } catch (e) {
      console.warn('Error loading library:', e);
    }
  }, [libraryTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateCollection = async () => {
    if (!newColName.trim()) return;
    try {
      await createCollection({
        name: newColName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      showToast('Collection created ✓', 'success');
      setIsCreateModalOpen(false);
      setNewColName('');
      loadData();
    } catch (e) {
      showToast('Failed to create collection', 'error');
    }
  };

  const availableColors: AccentColor[] = ['yellow', 'mint', 'pink', 'lavender', 'blue', 'peach'];

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
        {/* Title Block with Playful Graphics */}
        <View style={styles.titleContainer}>
          <View style={styles.titleCol}>
            <Text style={[TYPOGRAPHY.display, styles.titleText, { color: themeColors.text }]}>
              Library
            </Text>
            <Text style={[TYPOGRAPHY.body, styles.subtitleText, { color: themeColors.textSecondary }]}>
              Your collections, your way.{'\n'}Organize, explore and revisit what you've saved.
            </Text>
          </View>

          {/* Playful Sticky Note Graphic */}
          <View style={styles.noteGraphicWrapper}>
            <View style={[styles.folderYellowCard, SHADOWS.subtle]} />
            <View style={[styles.folderMintCard, SHADOWS.subtle]} />
            <View style={[styles.stickyNoteCard, SHADOWS.card]}>
              <Text style={styles.stickyNoteText}>Ideas today{'\n'}Opportunities{'\n'}tomorrow. ♡</Text>
            </View>
            <Text style={[styles.organizedText, { color: themeColors.textSecondary }]}>
              A more{'\n'}organized you. ⤵
            </Text>
          </View>
        </View>

        {/* Tab & Layout Switcher Bar */}
        <View style={styles.tabsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            <TouchableOpacity
              onPress={() => setLibraryTab('collections')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: libraryTab === 'collections' ? accent.primary : themeColors.card,
                  borderColor: libraryTab === 'collections' ? accent.primary : themeColors.border,
                },
              ]}
            >
              <Folder
                size={14}
                color={libraryTab === 'collections' ? '#0F172A' : themeColors.text}
              />
              <Text
                style={[
                  TYPOGRAPHY.subhead,
                  styles.tabPillText,
                  { color: libraryTab === 'collections' ? '#0F172A' : themeColors.text, fontWeight: libraryTab === 'collections' ? '700' : '500' },
                ]}
              >
                Collections
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLibraryTab('tags')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: libraryTab === 'tags' ? accent.primary : themeColors.card,
                  borderColor: libraryTab === 'tags' ? accent.primary : themeColors.border,
                },
              ]}
            >
              <TagIcon
                size={14}
                color={libraryTab === 'tags' ? '#0F172A' : themeColors.text}
              />
              <Text
                style={[
                  TYPOGRAPHY.subhead,
                  styles.tabPillText,
                  { color: libraryTab === 'tags' ? '#0F172A' : themeColors.text, fontWeight: libraryTab === 'tags' ? '700' : '500' },
                ]}
              >
                Tags
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLibraryTab('archive')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: libraryTab === 'archive' ? accent.primary : themeColors.card,
                  borderColor: libraryTab === 'archive' ? accent.primary : themeColors.border,
                },
              ]}
            >
              <Archive
                size={14}
                color={libraryTab === 'archive' ? '#0F172A' : themeColors.text}
              />
              <Text
                style={[
                  TYPOGRAPHY.subhead,
                  styles.tabPillText,
                  { color: libraryTab === 'archive' ? '#0F172A' : themeColors.text, fontWeight: libraryTab === 'archive' ? '700' : '500' },
                ]}
              >
                Archive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLibraryTab('trash')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: libraryTab === 'trash' ? accent.primary : themeColors.card,
                  borderColor: libraryTab === 'trash' ? accent.primary : themeColors.border,
                },
              ]}
            >
              <Trash2
                size={14}
                color={libraryTab === 'trash' ? '#0F172A' : themeColors.text}
              />
              <Text
                style={[
                  TYPOGRAPHY.subhead,
                  styles.tabPillText,
                  { color: libraryTab === 'trash' ? '#0F172A' : themeColors.text, fontWeight: libraryTab === 'trash' ? '700' : '500' },
                ]}
              >
                Trash
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Right layout and sort triggers */}
          <View style={styles.rightControls}>
            <TouchableOpacity
              onPress={toggleLibraryLayout}
              style={[
                styles.layoutToggleBtn,
                {
                  backgroundColor: isDark ? '#334155' : ACCENT_PALETTES.mint.light,
                  borderColor: isDark ? '#475569' : ACCENT_PALETTES.mint.border,
                },
              ]}
            >
              {libraryLayout === 'grid' ? (
                <LayoutGrid size={17} color={isDark ? '#34D399' : ACCENT_PALETTES.mint.deep} />
              ) : (
                <List size={17} color={isDark ? '#34D399' : ACCENT_PALETTES.mint.deep} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Collections Tab Content */}
        {libraryTab === 'collections' && (
          <>
            {libraryLayout === 'grid' ? (
              /* 3-column Collection Grid */
              <View style={styles.gridContainer}>
                {/* Card 1: New Collection Trigger */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsCreateModalOpen(true)}
                  style={[
                    styles.newColCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                    SHADOWS.card,
                  ]}
                >
                  <View style={styles.plusCircle}>
                    <Plus size={20} color={themeColors.text} />
                  </View>
                  <Text style={[TYPOGRAPHY.subhead, styles.newColTitle, { color: themeColors.text }]}>
                    New Collection
                  </Text>
                  <Text style={[styles.newColDesc, { color: themeColors.textMuted }]}>
                    Create your own space
                  </Text>
                </TouchableOpacity>

                {/* Collections Cards */}
                {collections.map((col) => (
                  <View key={col.id} style={styles.gridItemWrapper}>
                    <CollectionCard collection={col} variant="grid" onDeleted={loadData} />
                  </View>
                ))}
              </View>
            ) : (
              /* Full-width List View */
              <View style={styles.listContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsCreateModalOpen(true)}
                  style={[
                    styles.newColListCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    },
                    SHADOWS.card,
                  ]}
                >
                  <View style={styles.plusCircle}>
                    <Plus size={18} color={themeColors.text} />
                  </View>
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={[TYPOGRAPHY.subhead, { color: themeColors.text, fontWeight: '700' }]}>
                      New Collection
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: themeColors.textMuted }]}>
                      Create your own space
                    </Text>
                  </View>
                </TouchableOpacity>

                {collections.map((col) => (
                  <CollectionCard
                    key={col.id}
                    collection={col}
                    variant="list"
                    onDeleted={loadData}
                  />
                ))}
              </View>
            )}

            {/* Section: Recently Updated */}
            <View style={styles.recentSectionHeader}>
              <Text style={[TYPOGRAPHY.title2, { color: themeColors.text }]}>
                Recently Updated
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/inbox')}
                style={styles.seeAllBtn}
              >
                <Text style={[TYPOGRAPHY.footnote, { color: themeColors.textSecondary, fontWeight: '600' }]}>
                  See all
                </Text>
                <ArrowRight size={13} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.recentLinksList}>
              {recentLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  variant="horizontal"
                  onDeleted={() => {
                    setRecentLinks((prev) => prev.filter((l) => l.id !== link.id));
                    loadData();
                  }}
                  onUpdated={loadData}
                />
              ))}
            </View>
          </>
        )}

        {/* Archive or Trash Tab Content */}
        {(libraryTab === 'archive' || libraryTab === 'trash') && (
          <View style={styles.archiveTrashList}>
            {tabLinks.length > 0 ? (
              tabLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  variant="horizontal"
                  onDeleted={() => {
                    setTabLinks((prev) => prev.filter((l) => l.id !== link.id));
                    loadData();
                  }}
                  onUpdated={loadData}
                />
              ))
            ) : (
              <View style={[styles.emptyTabCard, { backgroundColor: themeColors.cardSecondary }]}>
                <Text style={[TYPOGRAPHY.title3, { color: themeColors.text }]}>
                  No {libraryTab} items
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, marginTop: 4 }]}>
                  Items moved to {libraryTab} will appear here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* New Collection Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.createModalCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
              SHADOWS.modal,
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={[TYPOGRAPHY.title2, { color: themeColors.text }]}>
                New Collection
              </Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[TYPOGRAPHY.footnote, styles.inputLabel, { color: themeColors.textSecondary }]}>
              COLLECTION NAME
            </Text>
            <TextInput
              style={[
                styles.nameInput,
                TYPOGRAPHY.body,
                {
                  backgroundColor: themeColors.cardSecondary,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              placeholder="e.g. Design Inspiration, AI Tools..."
              placeholderTextColor={themeColors.textMuted}
              value={newColName}
              onChangeText={setNewColName}
              autoFocus
            />

            <Text style={[TYPOGRAPHY.footnote, styles.inputLabel, { color: themeColors.textSecondary, marginTop: SPACING.md }]}>
              ACCENT COLOR
            </Text>
            <View style={styles.colorPickerRow}>
              {availableColors.map((colKey) => (
                <TouchableOpacity
                  key={colKey}
                  onPress={() => setSelectedColor(colKey)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: ACCENT_PALETTES[colKey].primary },
                  ]}
                >
                  {selectedColor === colKey && <Check size={16} color="#0F172A" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCreateCollection}
              disabled={!newColName.trim()}
              style={[
                styles.createBtn,
                {
                  backgroundColor: accent.primary,
                  opacity: newColName.trim() ? 1 : 0.6,
                },
              ]}
            >
              <Text style={[TYPOGRAPHY.bodyBold, { color: '#0F172A' }]}>
                Create Collection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  titleText: {
    letterSpacing: -0.8,
  },
  subtitleText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
  },
  noteGraphicWrapper: {
    width: 100,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderYellowCard: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 44,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF08A',
    transform: [{ rotate: '-8deg' }],
  },
  folderMintCard: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 44,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#A7F3D0',
    transform: [{ rotate: '8deg' }],
  },
  stickyNoteCard: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 68,
    height: 54,
    borderRadius: 6,
    backgroundColor: '#FCE7F3',
    transform: [{ rotate: '4deg' }],
    padding: 4,
    justifyContent: 'center',
  },
  stickyNoteText: {
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
    textAlign: 'center',
    color: '#831843',
  },
  organizedText: {
    position: 'absolute',
    top: -6,
    left: -16,
    fontSize: 9,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  layoutToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
  },
  newColListCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: SPACING.sm,
  },
  gridItemWrapper: {
    width: '33.33%',
    padding: SPACING.xs,
  },
  newColCard: {
    width: '33.33%',
    minHeight: 110,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    margin: SPACING.xs,
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  newColTitle: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  newColDesc: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentLinksList: {
    paddingHorizontal: SPACING.lg,
  },
  archiveTrashList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  emptyTabCard: {
    padding: SPACING.xxxl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  createModalCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  nameInput: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
});
