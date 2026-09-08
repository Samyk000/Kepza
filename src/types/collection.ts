import { AccentColor } from '../theme/colors';

export interface Collection {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g., 'folder', 'cpu', 'plane', 'sparkles', 'bookmark', 'briefcase', 'heart'
  color: AccentColor;
  parentId?: string;
  isDefault?: boolean;
  order: number;
  itemCount?: number;
  createdAt: string;
}

export interface CollectionCreateInput {
  name: string;
  icon: string;
  color: AccentColor;
  parentId?: string;
  order?: number;
}
