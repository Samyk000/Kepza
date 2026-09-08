import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ChevronLeft,
  Share2,
  Trash2,
  Archive,
  ExternalLink,
  Copy,
  Sparkles,
  Link as LinkIcon,
  Play,
  Clock,
  Folder,
  Check,
  Edit2,
  X,
  ChevronRight,
  FolderPlus,
} from 'lucide-react-native';
import { getLinkById, updateLink, deleteLink } from '../../src/db/queries/links';
import { getCollections } from '../../src/db/queries/collections';
import { Link } from '../../src/types/link';
import { Collection } from '../../src/types/collection';
import { ACCENT_PALETTES } from '../../src/theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../src/theme/tokens';
import { TYPOGRAPHY } from '../../src/theme/typography';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUiStore } from '../../src/store/uiStore';
import { useTheme } from '../../src/theme/useTheme';
import * as Clipboard from 'expo-clipboard';

export default function LinkDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { isDark, accent, themeColors } = useTheme();
  const browserChoice = useSettingsStore((s) => s.browserChoice);
  const showToast = useUiStore((s) => s.showToast);

  const [link, setLink] = useState<Link | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [noteText, setNoteText] = useState('');
  const [isSavedNote, setIsSavedNote] = useState(false);

  // Edit Link Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Change Folder / Collection Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    if (id) {
      getLinkById(id).then((l) => {
        if (l) {
          setLink(l);
          setNoteText(l.note || '');
          setEditTitle(l.title || '');
          setEditUrl(l.url || '');
          setEditDescription(l.description || '');
          // Mark lastOpenedAt
          updateLink(id, { lastOpenedAt: new Date().toISOString() });
        }
      });
      getCollections().then(setCollections);
    }
  }, [id]);

  const handleOpenLink = async () => {
    if (!link) return;
    try {
      await WebBrowser.openBrowserAsync(link.url);
    } catch (e) {
      console.warn('Error opening link:', e);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link.url);
    showToast('Link copied to clipboard ✓', 'success');
  };

  const handleShare = async () => {
    if (!link) return;
    try {
      await Share.share({
        message: `${link.title}\n${link.url}`,
        url: link.url,
        title: link.title,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleSaveNote = async () => {
    if (!link) return;
    await updateLink(link.id, { note: noteText.trim() });
    setIsSavedNote(true);
    showToast('Context note updated ✓', 'success');
    setTimeout(() => setIsSavedNote(false), 2000);
  };


  const handleSaveEdit = async () => {
    if (!link || !editUrl.trim()) {
      showToast('URL is required', 'error');
      return;
    }
    setIsSavingEdit(true);
    try {
      const updated = await updateLink(link.id, {
        title: editTitle.trim() || link.title,
        url: editUrl.trim(),
        description: editDescription.trim(),
      });
      if (updated) {
        setLink(updated);
      }
      setIsEditModalOpen(false);
      showToast('Link details updated ✓', 'success');
    } catch (e) {
      showToast('Failed to update link', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSelectFolder = async (collectionId: string | null) => {
    if (!link) return;
    try {
      const collectionIds = collectionId ? [collectionId] : [];
      const updated = await updateLink(link.id, { collectionIds });
      if (updated) {
        setLink({ ...link, collectionIds });
      }
      setIsFolderModalOpen(false);
      const colName = collections.find((c) => c.id === collectionId)?.name;
      showToast(collectionId ? `Moved to ${colName} ✓` : 'Moved to Inbox ✓', 'success');
    } catch (e) {
      showToast('Failed to change folder', 'error');
    }
  };

  const handleDelete = () => {
    if (!link) return;
    Alert.alert('Delete Link', 'Move this link to Trash?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLink(link.id);
          showToast('Link moved to Trash', 'info');
          handleBack();
        },
      },
    ]);
  };

  if (!link) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary }]}>Loading link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeCollection = collections.find((c) =>
    link.collectionIds?.includes(c.id)
  );

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

        <View style={styles.headerRightBtns}>
          {/* Edit URL & Details Button */}
          <TouchableOpacity
            onPress={() => {
              setEditTitle(link.title || '');
              setEditUrl(link.url || '');
              setEditDescription(link.description || '');
              setIsEditModalOpen(true);
            }}
            style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Edit2 size={18} color={themeColors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Share2 size={18} color={themeColors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const newStatus = link.status === 'archived' ? 'organized' : 'archived';
              await updateLink(link.id, { status: newStatus });
              showToast(newStatus === 'archived' ? 'Archived link' : 'Restored link', 'info');
              setLink({ ...link, status: newStatus });
            }}
            style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Archive size={18} color={themeColors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.circleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Trash2 size={18} color={themeColors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Media Header (16:9 Thumbnail) */}
        <View style={styles.mediaContainer}>
          {link.thumbnail ? (
            <Image source={{ uri: link.thumbnail }} style={styles.mediaImage} />
          ) : (
            <View style={[styles.mediaPlaceholder, { backgroundColor: themeColors.cardSecondary }]}>
              <LinkIcon size={36} color={themeColors.textSecondary} />
            </View>
          )}

          <View style={styles.floatingTypeBadge}>
            <Text style={styles.floatingTypeText}>
              {link.source || capitalize(link.contentType)}
            </Text>
          </View>

          {link.contentType === 'video' && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleOpenLink}
              style={styles.playOverlayBtn}
            >
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Link Info Block */}
        <View style={[styles.infoBlock, { backgroundColor: themeColors.card, borderColor: themeColors.border }, SHADOWS.card]}>
          <View style={styles.titleRow}>
            <Text style={[TYPOGRAPHY.title1, styles.linkTitle, { color: themeColors.text, flex: 1 }]}>
              {link.title}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditTitle(link.title || '');
                setEditUrl(link.url || '');
                setEditDescription(link.description || '');
                setIsEditModalOpen(true);
              }}
              style={[styles.editPencilBtn, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.border }]}
            >
              <Edit2 size={13} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* URL Row with Direct Edit Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setEditTitle(link.title || '');
              setEditUrl(link.url || '');
              setEditDescription(link.description || '');
              setIsEditModalOpen(true);
            }}
            style={[styles.urlRowBanner, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.border }]}
          >
            <LinkIcon size={13} color={themeColors.accentDeep || themeColors.textSecondary} />
            <Text style={[styles.urlBannerText, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {link.url}
            </Text>
            <Text style={[styles.editUrlBadge, { color: isDark ? '#FBBF24' : '#0284C7' }]}>
              Edit
            </Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={styles.domainChip}>
              <Text style={[styles.domainText, { color: themeColors.textSecondary }]}>
                {link.domain}
              </Text>
            </View>
            <View style={styles.savedDateChip}>
              <Clock size={12} color={themeColors.textMuted} />
              <Text style={[styles.savedDateText, { color: themeColors.textMuted }]}>
                Saved {new Date(link.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {link.description ? (
            <Text style={[TYPOGRAPHY.body, styles.descriptionText, { color: themeColors.textSecondary }]}>
              {link.description}
            </Text>
          ) : null}
        </View>

        {/* 📁 Folder & Placement Section (Interactive) */}
        <View
          style={[
            styles.folderCard,
            { backgroundColor: themeColors.card, borderColor: themeColors.border },
            SHADOWS.card,
          ]}
        >
          <View style={styles.folderCardHeader}>
            <View style={styles.folderLeftContent}>
              <View style={[styles.folderIconCircle, { backgroundColor: activeCollection ? (isDark ? '#334155' : ACCENT_PALETTES.mint.light) : themeColors.cardSecondary }]}>
                <Folder size={18} color={activeCollection ? (isDark ? '#34D399' : '#059669') : themeColors.textSecondary} />
              </View>
              <View>
                <Text style={[TYPOGRAPHY.caption, { color: themeColors.textMuted }]}>
                  Folder / Collection
                </Text>
                <Text style={[TYPOGRAPHY.subhead, { color: themeColors.text, fontWeight: '700' }]}>
                  {activeCollection ? activeCollection.name : 'Inbox (No folder)'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFolderModalOpen(true)}
              style={[
                styles.changeFolderBtn,
                { backgroundColor: isDark ? '#334155' : themeColors.cardSecondary, borderColor: themeColors.border },
              ]}
            >
              <Text style={[styles.changeFolderBtnText, { color: themeColors.text }]}>
                {activeCollection ? 'Change Folder' : 'Choose Folder'}
              </Text>
              <ChevronRight size={14} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 💭 Kepza Defining Feature: Context ("Why I kept this") */}
        <View
          style={[
            styles.contextBlock,
            {
              backgroundColor: isDark ? '#1E293B' : ACCENT_PALETTES.lavender.light,
              borderColor: isDark ? '#334155' : ACCENT_PALETTES.lavender.border,
            },
            SHADOWS.card,
          ]}
        >
          <View style={styles.contextHeader}>
            <View style={styles.contextTitleRow}>
              <Sparkles size={18} color="#7C3AED" />
              <Text style={[TYPOGRAPHY.title3, styles.contextTitle, { color: isDark ? '#F8FAFC' : '#4C1D95' }]}>
                Why I kept this
              </Text>
            </View>
            <TouchableOpacity onPress={handleSaveNote} style={styles.saveNoteBtn}>
              {isSavedNote ? (
                <Check size={16} color="#059669" />
              ) : (
                <Text style={[styles.saveNoteText, { color: '#7C3AED' }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.contextInput,
              TYPOGRAPHY.body,
              { color: isDark ? '#F8FAFC' : '#1E1B4B' },
            ]}
            multiline
            placeholder="Add context on why this mattered..."
            placeholderTextColor={isDark ? '#94A3B8' : '#7C3AED'}
            value={noteText}
            onChangeText={(t) => t.length <= 500 && setNoteText(t)}
            onBlur={handleSaveNote}
          />
          <Text style={[styles.charCount, { color: isDark ? '#94A3B8' : '#7C3AED' }]}>
            {noteText.length}/500
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
          SHADOWS.cardHover,
        ]}
      >
        <TouchableOpacity
          onPress={handleCopy}
          style={[styles.copyBtn, { backgroundColor: themeColors.cardSecondary, borderColor: themeColors.border }]}
        >
          <Copy size={18} color={themeColors.text} />
        </TouchableOpacity>

        {/* High-Contrast Open Link Button: Guaranteed visible in both Dark & Light themes */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleOpenLink}
          style={[
            styles.openLinkBtn,
            { backgroundColor: isDark ? '#FFFFFF' : '#0F172A' },
          ]}
        >
          <Text
            style={[
              TYPOGRAPHY.bodyBold,
              { color: isDark ? '#0F172A' : '#FFFFFF', fontSize: 15 },
            ]}
          >
            Open Link
          </Text>
          <ExternalLink
            size={16}
            color={isDark ? '#0F172A' : '#FFFFFF'}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* ✏️ Modal 1: Edit Link Details (URL, Title, Description) */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Edit2 size={18} color={themeColors.text} />
                <Text style={[TYPOGRAPHY.title3, { color: themeColors.text }]}>
                  Edit Link Details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={[styles.modalCloseBtn, { backgroundColor: themeColors.cardSecondary }]}
              >
                <X size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                URL
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: themeColors.cardSecondary,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={editUrl}
                onChangeText={setEditUrl}
                placeholder="https://example.com"
                placeholderTextColor={themeColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 14 }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: themeColors.cardSecondary,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Link title"
                placeholderTextColor={themeColors.textMuted}
              />

              <Text style={[styles.inputLabel, { color: themeColors.textSecondary, marginTop: 14 }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textAreaInput,
                  {
                    backgroundColor: themeColors.cardSecondary,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Optional description"
                placeholderTextColor={themeColors.textMuted}
                multiline
              />
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={[styles.cancelBtn, { borderColor: themeColors.border }]}
              >
                <Text style={[TYPOGRAPHY.subhead, { color: themeColors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={isSavingEdit}
                style={[
                  styles.saveBtn,
                  { backgroundColor: isDark ? '#FFFFFF' : '#0F172A' },
                ]}
              >
                <Text style={[TYPOGRAPHY.subhead, { color: isDark ? '#0F172A' : '#FFFFFF', fontWeight: '700' }]}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 📁 Modal 2: Change Folder / Collection Picker */}
      <Modal
        visible={isFolderModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFolderModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Folder size={18} color={themeColors.text} />
                <Text style={[TYPOGRAPHY.title3, { color: themeColors.text }]}>
                  Move to Folder / Collection
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFolderModalOpen(false)}
                style={[styles.modalCloseBtn, { backgroundColor: themeColors.cardSecondary }]}
              >
                <X size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
              {/* Option: Inbox (Remove from Collections) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelectFolder(null)}
                style={[
                  styles.folderOptionRow,
                  {
                    backgroundColor: !activeCollection
                      ? (isDark ? '#334155' : ACCENT_PALETTES.yellow.light)
                      : themeColors.cardSecondary,
                    borderColor: !activeCollection
                      ? ACCENT_PALETTES.yellow.primary
                      : themeColors.border,
                  },
                ]}
              >
                <View style={styles.folderOptionLeft}>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>📥</Text>
                  <View>
                    <Text style={[TYPOGRAPHY.subhead, { color: themeColors.text, fontWeight: '600' }]}>
                      Inbox
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: themeColors.textSecondary }]}>
                      Default landing zone (no collection)
                    </Text>
                  </View>
                </View>
                {!activeCollection && (
                  <Check size={18} color={isDark ? '#FBBF24' : '#0F172A'} strokeWidth={2.5} />
                )}
              </TouchableOpacity>

              {/* User Collections */}
              {collections.map((c) => {
                const isCurrent = link.collectionIds?.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectFolder(c.id)}
                    style={[
                      styles.folderOptionRow,
                      {
                        backgroundColor: isCurrent
                          ? (isDark ? '#334155' : ACCENT_PALETTES.mint.light)
                          : themeColors.cardSecondary,
                        borderColor: isCurrent
                          ? ACCENT_PALETTES.mint.primary
                          : themeColors.border,
                      },
                    ]}
                  >
                    <View style={styles.folderOptionLeft}>
                      <Text style={{ fontSize: 18, marginRight: 10 }}>{c.icon || '📁'}</Text>
                      <View>
                        <Text style={[TYPOGRAPHY.subhead, { color: themeColors.text, fontWeight: '600' }]}>
                          {c.name}
                        </Text>
                        <Text style={[TYPOGRAPHY.caption, { color: themeColors.textSecondary }]}>
                          {c.itemCount} items
                        </Text>
                      </View>
                    </View>
                    {isCurrent && (
                      <Check size={18} color={isDark ? '#34D399' : '#0F172A'} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  headerRightBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 110,
    gap: SPACING.md,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  floatingTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  playOverlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBlock: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  linkTitle: {
    letterSpacing: -0.5,
  },
  editPencilBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  urlRowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: SPACING.sm,
    gap: 6,
  },
  urlBannerText: {
    flex: 1,
    fontSize: 12,
  },
  editUrlBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  domainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainText: {
    fontSize: 12,
    fontWeight: '600',
  },
  savedDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedDateText: {
    fontSize: 12,
  },
  descriptionText: {
    lineHeight: 22,
    marginTop: SPACING.xs,
  },
  folderCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  folderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  folderLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  folderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 2,
  },
  changeFolderBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contextBlock: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  contextTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  contextTitle: {
    fontWeight: '700',
  },
  saveNoteBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  saveNoteText: {
    fontWeight: '700',
    fontSize: 13,
  },
  contextInput: {
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  copyBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openLinkBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  folderOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
