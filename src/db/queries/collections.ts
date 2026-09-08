import { getDatabase } from '../client';
import { Collection, CollectionCreateInput } from '../../types/collection';

export async function getCollections(): Promise<Collection[]> {
  const db = await getDatabase();

  if (db.isWeb) {
    const data = db.getData();
    return data.collections.map((col: Collection) => {
      let count = 0;
      if (col.id === 'col-all') {
        count = data.links.filter((l: any) => l.status !== 'trash').length;
      } else {
        count = data.linkCollections.filter((lc: any) => lc.collectionId === col.id).length;
      }
      return {
        ...col,
        itemCount: count,
      };
    });
  }

  const rows = db.getAllSync(
    `SELECT c.*,
      CASE
        WHEN c.id = 'col-all' THEN (SELECT COUNT(*) FROM links WHERE status != 'trash')
        ELSE (SELECT COUNT(*) FROM link_collections WHERE collection_id = c.id)
      END as item_count
     FROM collections c
     ORDER BY c.display_order ASC, c.created_at ASC;`
  ) as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    parentId: r.parent_id || undefined,
    isDefault: Boolean(r.is_default),
    order: r.display_order,
    itemCount: r.item_count || 0,
    createdAt: r.created_at,
  }));
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const db = await getDatabase();

  if (db.isWeb) {
    const data = db.getData();
    const col = data.collections.find((c: Collection) => c.id === id);
    if (!col) return null;
    const count =
      col.id === 'col-all'
        ? data.links.filter((l: any) => l.status !== 'trash').length
        : data.linkCollections.filter((lc: any) => lc.collectionId === id).length;
    return { ...col, itemCount: count };
  }

  const row = db.getFirstSync(
    `SELECT c.*,
      CASE
        WHEN c.id = 'col-all' THEN (SELECT COUNT(*) FROM links WHERE status != 'trash')
        ELSE (SELECT COUNT(*) FROM link_collections WHERE collection_id = c.id)
      END as item_count
     FROM collections c
     WHERE c.id = ?;`,
    [id]
  ) as any;

  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    parentId: row.parent_id || undefined,
    isDefault: Boolean(row.is_default),
    order: row.display_order,
    itemCount: row.item_count || 0,
    createdAt: row.created_at,
  };
}

export async function createCollection(input: CollectionCreateInput): Promise<Collection> {
  const db = await getDatabase();
  const id = 'col-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newCol: Collection = {
    id,
    name: input.name,
    icon: input.icon || 'folder',
    color: input.color || 'yellow',
    parentId: input.parentId,
    order: input.order || 99,
    itemCount: 0,
    createdAt: now,
  };

  if (db.isWeb) {
    db.saveData((prev: any) => ({
      ...prev,
      collections: [...prev.collections, newCol],
    }));
    return newCol;
  }

  db.runSync(
    `INSERT INTO collections (id, name, icon, color, parent_id, display_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [newCol.id, newCol.name, newCol.icon, newCol.color, newCol.parentId || null, newCol.order, now]
  );

  return newCol;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const db = await getDatabase();
  if (db.isWeb) {
    db.saveData((prev: any) => ({
      ...prev,
      collections: prev.collections.filter((c: Collection) => c.id !== id),
      linkCollections: prev.linkCollections.filter((lc: any) => lc.collectionId !== id),
    }));
    return true;
  }

  db.runSync(`DELETE FROM collections WHERE id = ?;`, [id]);
  return true;
}
