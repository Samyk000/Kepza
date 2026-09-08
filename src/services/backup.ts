import { Platform } from 'react-native';
import { getDatabase } from '../db/client';
import { KepzaBackup } from '../types/backup';

export async function exportLibrary(): Promise<string> {
  const db = await getDatabase();
  let backupData: KepzaBackup;

  if (db.isWeb) {
    const data = db.getData();
    backupData = {
      version: '1.0',
      appName: 'Kepza',
      exportedAt: new Date().toISOString(),
      data: {
        links: data.links,
        collections: data.collections,
        tags: data.tags,
        linkCollections: data.linkCollections,
        linkTags: data.linkTags || [],
      },
    };
  } else {
    const links = db.getAllSync(`SELECT * FROM links;`);
    const collections = db.getAllSync(`SELECT * FROM collections;`);
    const tags = db.getAllSync(`SELECT * FROM tags;`);
    const linkCollections = db.getAllSync(`SELECT * FROM link_collections;`);
    const linkTags = db.getAllSync(`SELECT * FROM link_tags;`);

    backupData = {
      version: '1.0',
      appName: 'Kepza',
      exportedAt: new Date().toISOString(),
      data: {
        links,
        collections,
        tags,
        linkCollections,
        linkTags,
      },
    };
  }

  const jsonStr = JSON.stringify(backupData, null, 2);

  if (Platform.OS === 'web') {
    // Web trigger download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kepza_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return jsonStr;
  }

  // Native share/file system
  try {
    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');
    const fileUri = `${FileSystem.documentDirectory}kepza_backup_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonStr);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Kepza Library',
      });
    }
  } catch (e) {
    console.warn('Native export error:', e);
  }

  return jsonStr;
}

export async function importLibrary(jsonContent: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const parsed: KepzaBackup = JSON.parse(jsonContent);
    if (!parsed.data || !Array.isArray(parsed.data.links)) {
      return { success: false, count: 0, error: 'Invalid Kepza backup file format.' };
    }

    const db = await getDatabase();
    const linksToImport = parsed.data.links;
    const collectionsToImport = parsed.data.collections || [];

    if (db.isWeb) {
      db.saveData((prev: any) => {
        const existingLinkIds = new Set(prev.links.map((l: any) => l.id));
        const newLinks = linksToImport.filter((l) => !existingLinkIds.has(l.id));

        const existingColIds = new Set(prev.collections.map((c: any) => c.id));
        const newCols = collectionsToImport.filter((c) => !existingColIds.has(c.id));

        return {
          ...prev,
          links: [...newLinks, ...prev.links],
          collections: [...newCols, ...prev.collections],
          linkCollections: [...(parsed.data.linkCollections || []), ...prev.linkCollections],
        };
      });
      return { success: true, count: linksToImport.length };
    }

    // Native SQLite import
    for (const col of collectionsToImport) {
      db.runSync(
        `INSERT OR IGNORE INTO collections (id, name, icon, color, parent_id, is_default, display_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [col.id, col.name, col.icon, col.color, col.parentId || null, col.isDefault ? 1 : 0, col.order || 0, col.createdAt]
      );
    }

    for (const link of linksToImport) {
      db.runSync(
        `INSERT OR REPLACE INTO links (id, url, normalized_url, title, description, thumbnail, favicon, domain, content_type, source, note, reading_progress, status, is_pinned, created_at, updated_at, last_opened_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          link.id,
          link.url,
          link.normalizedUrl,
          link.title,
          link.description || null,
          link.thumbnail || null,
          link.favicon || null,
          link.domain,
          link.contentType || 'website',
          link.source || null,
          link.note || null,
          link.readingProgress || 0,
          link.status || 'inbox',
          link.isPinned ? 1 : 0,
          link.createdAt,
          link.updatedAt,
          link.lastOpenedAt || null,
        ]
      );
    }

    return { success: true, count: linksToImport.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Failed to parse JSON backup.' };
  }
}
