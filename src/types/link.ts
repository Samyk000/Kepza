export type ContentType =
  | 'article'
  | 'video'
  | 'website'
  | 'social'
  | 'image'
  | 'code'
  | 'misc';

export type LinkStatus = 'inbox' | 'organized' | 'archived' | 'trash';

export interface Link {
  id: string;
  url: string;
  normalizedUrl: string;
  title: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  domain: string;
  contentType: ContentType;
  source?: string;
  note?: string; // "Why did I keep this?" context note
  readingProgress?: number; // 0 to 100
  status: LinkStatus;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  collectionIds?: string[];
  tagIds?: string[];
}

export interface LinkCreateInput {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  domain?: string;
  contentType?: ContentType;
  source?: string;
  note?: string;
  collectionIds?: string[];
  tagIds?: string[];
  status?: LinkStatus;
}

export interface LinkUpdateInput {
  url?: string;
  domain?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  note?: string;
  readingProgress?: number;
  status?: LinkStatus;
  isPinned?: boolean;
  collectionIds?: string[];
  tagIds?: string[];
  lastOpenedAt?: string;
}

