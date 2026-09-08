import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Link as LinkIcon,
  X,
  FileText,
  Tag as TagIcon,
  Folder,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Play,
  ChevronDown,
} from 'lucide-react-native';
import { useUiStore } from '../../store/uiStore';
import { fetchMetadata, ExtractedMetadata } from '../../services/metadata';
import { createLink } from '../../db/queries/links';
import { getCollections } from '../../db/queries/collections';
import { Collection } from '../../types/collection';
import { COLORS, ACCENT_PALETTES } from '../../theme/colors';
import { RADIUS, SHADOWS, SPACING } from '../../theme/tokens';
import { TYPOGRAPHY } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';
import { triggerHaptic } from '../../utils/haptics';

interface AddLinkModalProps {
  onLinkAdded?: () => void;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ onLinkAdded }) => {
  const isOpen = useUiStore((s) => s.isAddModalOpen);
  const prefilledUrl = useUiStore((s) => s.prefilledUrl);
  const closeModal = useUiStore((s) => s.closeAddModal);
  const showToast = useUiStore((s) => s.showToast);

  const { isDark, accent, themeColors } = useTheme();

  const [url, setUrl] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<ExtractedMetadata | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('inbox');
  const [isColPickerOpen, setIsColPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCollections().then(setCollections);
      if (prefilledUrl) {
        setUrl(prefilledUrl);
        handleFetch(prefilledUrl);
      } else {
        setUrl('');
        setPreview(null);
        setNote('');
        setSelectedCollectionId('inbox');
      }
    }
  }, [isOpen, prefilledUrl]);

  const handleFetch = async (targetUrl: string) => {
    if (!targetUrl.trim() || targetUrl.length < 5) return;
    setLoadingPreview(true);
    try {
      const meta = await fetchMetadata(targetUrl);
      setPreview(meta);
    } catch (e) {
      console.warn('Error fetching metadata preview:', e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    if (text.includes('.') && (text.startsWith('http') || text.length > 8)) {
      handleFetch(text);
    }
  };

  const handleSave = async () => {
    if (!url.trim()) return;
    setSaving(true);

    try {
      let finalMeta = preview;
      if (!finalMeta) {
        finalMeta = await fetchMetadata(url);
      }

      const collectionIds =
        selectedCollectionId && selectedCollectionId !== 'inbox'
          ? [selectedCollectionId]
          : [];

      await createLink({
        url: finalMeta.url,
        title: finalMeta.title,
        description: finalMeta.description,
        thumbnail: finalMeta.thumbnail,
        favicon: finalMeta.favicon,
        domain: finalMeta.domain,
        contentType: finalMeta.contentType,
        source: finalMeta.source,
        note: note.trim() || undefined,
        collectionIds,
        status: collectionIds.length > 0 ? 'organized' : 'inbox',
      });

      useUiStore.getState().notifyLinkSaved();
      triggerHaptic('success');
      showToast('Saved to Kepza ✓', 'success');
      closeModal();
      if (onLinkAdded) onLinkAdded();
    } catch (e) {
      console.error('Error saving link:', e);
      showToast('Failed to save link', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedCol = collections.find((c) => c.id === selectedCollectionId);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeModal}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
            SHADOWS.modal,
          ]}
        >
          {/* Top Handle & Close */}
          <View style={styles.handleRow}>
            <View style={[styles.handleBar, { backgroundColor: themeColors.border }]} />
            <TouchableOpacity
              onPress={closeModal}
              style={[styles.closeIconBtn, { backgroundColor: themeColors.cardSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.headerBlock}>
              <View style={styles.headerTextCol}>
                <Text style={[TYPOGRAPHY.title1, { color: themeColors.text }]}>
                  Add Link to Kepza
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: themeColors.textSecondary, marginTop: 2 }]}>
                  Paste a link and we'll fetch the details automatically.
                </Text>
              </View>

              <View style={[styles.bubblePill, { backgroundColor: isDark ? '#1E293B' : accent.light, borderColor: isDark ? '#334155' : accent.border, borderWidth: 1 }]}>
                <Text style={[styles.bubbleText, { color: isDark ? accent.primary : accent.deep }]}>
                  Save now.{'\n'}Organize later.
                </Text>
              </View>
            </View>

            {/* URL Input Box */}
            <View
              style={[
                styles.urlInputBox,
                {
                  backgroundColor: themeColors.cardSecondary,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <LinkIcon size={18} color={themeColors.textSecondary} />
              <TextInput
                style={[
                  styles.urlTextInput,
                  TYPOGRAPHY.body,
                  { color: themeColors.text },
                ]}
                value={url}
                onChangeText={handleUrlChange}
                placeholder="https://example.com/article"
                placeholderTextColor={themeColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={() => handleFetch(url)}
              />
              {url.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setUrl('');
                    setPreview(null);
                  }}
                >
                  <X size={16} color={themeColors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Live Preview Card */}
            {loadingPreview && (
              <View style={[styles.loadingBox, { backgroundColor: themeColors.cardSecondary }]}>
                <ActivityIndicator size="small" color="#FBBF24" />
                <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                  Fetching title, thumbnail and metadata...
                </Text>
              </View>
            )}

            {preview && !loadingPreview && (
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.previewHeader}>
                  <Text style={[styles.sourceBadge, { color: themeColors.text }]}>
                    {preview.source}
                  </Text>
                  <View style={styles.statusPill}>
                    <CheckCircle size={12} color="#059669" />
                    <Text style={styles.statusText}>Preview loaded</Text>
                  </View>
                </View>

                <View style={styles.previewContent}>
                  {preview.thumbnail ? (
                    <View style={styles.previewThumbWrapper}>
                      <Image source={{ uri: preview.thumbnail }} style={styles.previewThumb} />
                      {preview.contentType === 'video' && (
                        <View style={styles.playIconOverlay}>
                          <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  ) : null}

                  <View style={styles.previewMeta}>
                    <Text
                      numberOfLines={2}
                      style={[TYPOGRAPHY.subhead, styles.previewTitle, { color: themeColors.text }]}
                    >
                      {preview.title}
                    </Text>
                    {preview.description ? (
                      <Text
                        numberOfLines={2}
                        style={[styles.previewDesc, { color: themeColors.textSecondary }]}
                      >
                        {preview.description}
                      </Text>
                    ) : null}
                    <View style={styles.previewDomainRow}>
                      <LinkIcon size={12} color={themeColors.textMuted} />
                      <Text style={[styles.previewDomainText, { color: themeColors.textMuted }]}>
                        {preview.domain}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Add extra (optional) Section */}
            <View style={styles.extraSection}>
              <View style={styles.dividerRow}>
                <Text style={[TYPOGRAPHY.footnote, styles.extraLabel, { color: themeColors.textMuted }]}>
                  Add extra (optional)
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: themeColors.borderLight }]} />
              </View>

              {/* Note Input */}
              <View
                style={[
                  styles.noteBox,
                  {
                    backgroundColor: themeColors.cardSecondary,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.noteHeader}>
                  <FileText size={16} color={themeColors.textSecondary} />
                  <TextInput
                    style={[styles.noteInput, TYPOGRAPHY.body, { color: themeColors.text }]}
                    placeholder="Why are you saving this? (Add a note...)"
                    placeholderTextColor={themeColors.textMuted}
                    multiline
                    value={note}
                    onChangeText={(t) => t.length <= 500 && setNote(t)}
                  />
                </View>
                <Text style={[styles.charCount, { color: themeColors.textMuted }]}>
                  {note.length}/500
                </Text>
              </View>

              {/* Collection Dropdown Picker */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsColPickerOpen(!isColPickerOpen)}
                style={[
                  styles.pickerRow,
                  {
                    backgroundColor: themeColors.cardSecondary,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.pickerLeft}>
                  <Folder size={18} color={themeColors.textSecondary} />
                  <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text, marginLeft: SPACING.sm }]}>
                    Save to collection
                  </Text>
                </View>
                <View style={styles.pickerRight}>
                  <Text style={[styles.pickerValue, { color: themeColors.textSecondary }]}>
                    {selectedCol ? selectedCol.name : 'Inbox'}
                  </Text>
                  <ChevronDown size={16} color={themeColors.textMuted} />
                </View>
              </TouchableOpacity>

              {isColPickerOpen && (
                <View style={[styles.colDropdown, { borderColor: themeColors.border, backgroundColor: themeColors.card }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCollectionId('inbox');
                      setIsColPickerOpen(false);
                    }}
                    style={[
                      styles.colOption,
                      selectedCollectionId === 'inbox' && { backgroundColor: themeColors.cardSecondary },
                    ]}
                  >
                    <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>📥 Inbox</Text>
                  </TouchableOpacity>
                  {collections
                    .filter((c) => c.id !== 'col-all')
                    .map((col) => (
                      <TouchableOpacity
                        key={col.id}
                        onPress={() => {
                          setSelectedCollectionId(col.id);
                          setIsColPickerOpen(false);
                        }}
                        style={[
                          styles.colOption,
                          selectedCollectionId === col.id && { backgroundColor: themeColors.cardSecondary },
                        ]}
                      >
                        <Text style={[TYPOGRAPHY.bodyMedium, { color: themeColors.text }]}>
                          📁 {col.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              disabled={saving || !url.trim()}
              style={[
                styles.saveButton,
                {
                  backgroundColor: accent.primary,
                  opacity: url.trim() ? 1 : 0.6,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : (
                <>
                  <Text style={[TYPOGRAPHY.title3, styles.saveButtonText, { color: '#0F172A' }]}>
                    Save to Kepza
                  </Text>
                  <ArrowRight size={18} color="#0F172A" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <Text style={[TYPOGRAPHY.footnote, styles.saveHelpText, { color: themeColors.textSecondary }]}>
              {selectedCollectionId === 'inbox'
                ? 'It will be saved to your Inbox. You can organize it later.'
                : `It will be saved in ${selectedCol?.name || 'your collection'}.`}
            </Text>

            {/* Privacy Shield Banner */}
            <View
              style={[
                styles.privacyBanner,
                {
                  backgroundColor: isDark ? '#064E3B' : ACCENT_PALETTES.mint.light,
                  borderColor: isDark ? '#047857' : ACCENT_PALETTES.mint.border,
                },
              ]}
            >
              <View style={styles.privacyIconWrapper}>
                <ShieldCheck size={20} color="#059669" />
              </View>
              <View style={styles.privacyTextCol}>
                <Text style={[TYPOGRAPHY.subhead, styles.privacyTitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
                  Your data stays on your device.
                </Text>
                <Text style={[TYPOGRAPHY.footnote, { color: isDark ? '#6EE7B7' : '#047857' }]}>
                  No account. No tracking. Just your links.
                </Text>
              </View>
              <Text style={[styles.privacyMotto, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
                Keep what{'\n'}matters. ♡
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheetContainer: {
    maxHeight: '92%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxxl : SPACING.xl,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: SPACING.xs,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  closeIconBtn: {
    position: 'absolute',
    right: SPACING.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bubblePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    transform: [{ rotate: '3deg' }],
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  urlInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 52,
    marginBottom: SPACING.md,
  },
  urlTextInput: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sourceBadge: {
    fontWeight: '700',
    fontSize: 13,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewThumbWrapper: {
    width: 90,
    height: 68,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    marginRight: SPACING.md,
  },
  previewThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMeta: {
    flex: 1,
  },
  previewTitle: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  previewDesc: {
    fontSize: 12,
    lineHeight: 15,
    marginTop: 2,
  },
  previewDomainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  previewDomainText: {
    fontSize: 11,
  },
  extraSection: {
    marginBottom: SPACING.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  extraLabel: {
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  noteBox: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    minHeight: 50,
    textAlignVertical: 'top',
    paddingTop: 0,
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as any) : {}),
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    marginTop: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickerValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  colDropdown: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  colOption: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveHelpText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  privacyIconWrapper: {
    marginRight: SPACING.sm,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  privacyMotto: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});
