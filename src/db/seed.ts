import { Collection } from '../types/collection';
import { Link } from '../types/link';
import { Tag } from '../types/tag';

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: 'col-all',
    name: 'All Links',
    icon: 'folder',
    color: 'yellow',
    isDefault: true,
    order: 0,
    itemCount: 0,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_TAGS: Tag[] = [];

export const SEED_LINKS: (Link & { collectionId?: string; tagNames?: string[] })[] = [];
