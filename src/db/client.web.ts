import { SEED_COLLECTIONS, SEED_LINKS, SEED_TAGS } from './seed';

let dbInstance: any = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  const storageKey = 'kepza_web_db_v1';
  let data: any = {
    collections: [...SEED_COLLECTIONS],
    links: [...SEED_LINKS],
    tags: [...SEED_TAGS],
    linkCollections: SEED_LINKS.filter((l) => l.collectionId).map((l) => ({
      linkId: l.id,
      collectionId: l.collectionId!,
      addedAt: l.createdAt,
    })),
    linkTags: [],
    searchHistory: [],
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        data = JSON.parse(saved);
        data.links = (data.links || []).filter((l: any) => !l.id?.startsWith('link-'));
        data.collections = (data.collections || []).filter((c: any) => c.id === 'col-all' || !c.id?.startsWith('col-'));
        data.tags = (data.tags || []).filter((t: any) => !t.id?.startsWith('tag-'));
        if (!data.collections.some((c: any) => c.id === 'col-all')) {
          data.collections.unshift(SEED_COLLECTIONS[0]);
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Web storage access error, using memory fallback:', e);
    }
  }

  const save = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    }
  };

  dbInstance = {
    isWeb: true,
    getData: () => data,
    saveData: (updater: (prev: any) => any) => {
      data = updater(data);
      save();
    },
  };

  return dbInstance;
}
