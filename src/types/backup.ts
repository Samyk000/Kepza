import { Link } from './link';
import { Collection } from './collection';
import { Tag } from './tag';

export interface KepzaBackup {
  version: '1.0';
  exportedAt: string;
  appName: 'Kepza';
  data: {
    links: Link[];
    collections: Collection[];
    tags: Tag[];
    linkCollections: { linkId: string; collectionId: string; addedAt: string }[];
    linkTags: { linkId: string; tagId: string }[];
  };
}
