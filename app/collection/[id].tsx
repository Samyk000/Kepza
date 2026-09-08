import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  Plus,
  Folder,
} from 'lucide-react-native';
import { getCollectionById, deleteCollection } from '../../src/db/queries/collections';
import { getAllLinks } from '../../src/db/queries/links';
import { Collection } from '../../src/types/collection';
import { Link } from '../../src/types/link';
import { LinkCard } from '../../src/components/links/LinkCard';
import { COLORS, ACCENT_PALETTES } from '../../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUiStore } from '../../src/store/uiStore';

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  const openAddModal = useUiStore((s) => s.openAddModal);
  const showToast = useUiStore((s) => s.showToast);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [col, colLinks] = await Promise.all([
        getCollectionById(id),
        getAllLinks({ collectionId: id }),
      ]);
      setCollection(col);
      setLinks(colLinks);
    } catch (e) {
      console.warn('Error loading collection:', e);
    }
  }, [id]);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/library');
    }
  };

  const handleDeleteCollection = () => {
    if (!collection || collection.isDefault) return;
    Alert.alert(
      'Delete Collection',
      `Delete "${collection.name}"? The links inside will remain in your library.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(collection.id);
            showToast('Collection deleted', 'info');
            handleBack();
          },
        },
      ]
    );
  };

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const palette = ACCENT_PALETTES[collection.color] || ACCENT_PALETTES.yellow;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color={themeColors.text} />
        </TouchableOpacity>

        {!collection.isDefault && (
          <TouchableOpacity
            onPress={handleDeleteCollection}
            style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Trash2 size={18} color={themeColors.danger} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
        }
      >
        {/* Collection Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1E293B' : palette.light,
              borderColor: isDark ? '#334155' : palette.border,
            },
            SHADOWS.card,
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
              <Folder size={24} color={palette.text} />
            </View>
            <View style={[styles.itemCountBadge, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
              <Text style={[styles.itemCountText, { color: palette.text }]}>
                {links.length} items
              </Text>
            </View>
          </View>

          <Text style={[TYPOGRAPHY.display, styles.colTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            {collection.name}
          </Text>
        </View>

        {/* Links List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={[TYPOGRAPHY.title2, { color: themeColors.text }]}>
            Saved Links
          </Text>
          <TouchableOpacity
            onPress={() => openAddModal()}
            style={[styles.addLinkSmallBtn, { backgroundColor: themeColors.actionPill }]}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={[styles.addLinkSmallText, { color: '#FFFFFF' }]}>Add Link</Text>
          </TouchableOpacity>
        </View>

        {/* Links List */}
        <View style={styles.linksContainer}>
          {links.length > 0 ? (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                variant="horizontal"
                onDeleted={() => {
                  setLinks((prev) => prev.filter((l) => l.id !== link.id));
                  loadData();
                }}
                onUpdated={loadData}
              />
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: themeColors.cardSecondary }]}>
              <Text style={[TYPOGRAPHY.title3, { color: themeColors.text }]}>
                This collection is empty
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, marginTop: 4 }]}>
                Tap the Add Link button to save your first item here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  heroCard: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  itemCountText: {
    fontWeight: '700',
    fontSize: 12,
  },
  colTitle: {
    letterSpacing: -0.8,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addLinkSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  addLinkSmallText: {
    fontWeight: '700',
    fontSize: 12,
  },
  linksContainer: {},
  emptyBox: {
    padding: SPACING.xxxl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
