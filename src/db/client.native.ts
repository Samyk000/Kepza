import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, CREATE_FTS_SQL } from './schema';
import { SEED_COLLECTIONS, SEED_LINKS, SEED_TAGS } from './seed';

let dbInstance: any = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  const db = SQLite.openDatabaseSync('kepza.db');

  // Initialize tables
  db.execSync(CREATE_TABLES_SQL);
  try {
    db.execSync(CREATE_FTS_SQL);
  } catch (e) {
    console.warn('FTS5 table initialization skipped or already present:', e);
  }

  // Purge any previously seeded dummy/mock items
  try {
    db.runSync("DELETE FROM links WHERE id LIKE 'link-%';");
    db.runSync("DELETE FROM link_collections WHERE link_id LIKE 'link-%' OR (collection_id LIKE 'col-%' AND collection_id != 'col-all');");
    db.runSync("DELETE FROM collections WHERE id LIKE 'col-%' AND id != 'col-all';");
    db.runSync("DELETE FROM tags WHERE id LIKE 'tag-%';");
  } catch (e) {
    console.warn('Dummy cleanup skipped:', e);
  }

  // Ensure default "All Links" collection exists
  const allCol = db.getFirstSync("SELECT id FROM collections WHERE id = 'col-all';");
  if (!allCol) {
    db.runSync(
      `INSERT OR IGNORE INTO collections (id, name, icon, color, parent_id, is_default, display_order, created_at)
       VALUES ('col-all', 'All Links', 'folder', 'yellow', NULL, 1, 0, ?);`,
      [new Date().toISOString()]
    );
  }

  dbInstance = db;
  return dbInstance;
}
