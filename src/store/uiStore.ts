import { create } from 'zustand';
import { ContentType } from '../types/link';

export type InboxFilter = 'all' | ContentType;
export type LibraryTab = 'collections' | 'tags' | 'archive' | 'trash';
export type LibraryLayout = 'grid' | 'list';

interface UiState {
  inboxFilter: InboxFilter;
  findFilter: InboxFilter;
  searchQuery: string;
  isAddModalOpen: boolean;
  prefilledUrl: string;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  libraryTab: LibraryTab;
  libraryLayout: LibraryLayout;
  lastLinkSavedAt: number;

  // Actions
  setInboxFilter: (filter: InboxFilter) => void;
  setFindFilter: (filter: InboxFilter) => void;
  setSearchQuery: (query: string) => void;
  openAddModal: (url?: string) => void;
  closeAddModal: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  setLibraryTab: (tab: LibraryTab) => void;
  setLibraryLayout: (layout: LibraryLayout) => void;
  toggleLibraryLayout: () => void;
  notifyLinkSaved: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  inboxFilter: 'all',
  findFilter: 'all',
  searchQuery: '',
  isAddModalOpen: false,
  prefilledUrl: '',
  toast: null,
  libraryTab: 'collections',
  libraryLayout: 'grid',
  lastLinkSavedAt: 0,

  setInboxFilter: (inboxFilter) => set({ inboxFilter }),
  setFindFilter: (findFilter) => set({ findFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  openAddModal: (url = '') => set({ isAddModalOpen: true, prefilledUrl: url }),
  closeAddModal: () => set({ isAddModalOpen: false, prefilledUrl: '' }),
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
  setLibraryTab: (libraryTab) => set({ libraryTab }),
  setLibraryLayout: (libraryLayout) => set({ libraryLayout }),
  toggleLibraryLayout: () =>
    set((state) => ({
      libraryLayout: state.libraryLayout === 'grid' ? 'list' : 'grid',
    })),
  notifyLinkSaved: () => set({ lastLinkSavedAt: Date.now() }),
}));
