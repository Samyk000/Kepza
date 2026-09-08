import { getDatabase } from '../client';
import { Link, ContentType } from '../../types/link';

export async function searchLinks(
  query: string,
  filterType?: ContentType | 'all'
): Promise<Link[]> {
  const db = await getDatabase();
  const trimmed = query.trim();

  if (!trimmed) return [];

  if (db.isWeb) {
    const data = db.getData();
    const qLower = trimmed.toLowerCase();
    return data.links
      .filter((l: Link) => l.status !== 'trash')
      .filter((l: Link) => {
        if (filterType && filterType !== 'all' && l.contentType !== filterType) {
          return false;
        }
        return (
          l.title.toLowerCase().includes(qLower) ||
          (l.description && l.description.toLowerCase().includes(qLower)) ||
          (l.note && l.note.toLowerCase().includes(qLower)) ||
          l.url.toLowerCase().includes(qLower) ||
          l.domain.toLowerCase().includes(qLower)
        );
      });
  }

  // Native SQLite with FTS5 or LIKE search
  try {
    let sql = `
      SELECT DISTINCT l.*
      FROM links l
      JOIN links_fts fts ON l.rowid = fts.rowid
      WHERE links_fts MATCH ?
        AND l.status != 'trash'
    `;
    const params: any[] = [`${trimmed}*`];

    if (filterType && filterType !== 'all') {
      sql += ` AND l.content_type = ?`;
      params.push(filterType);
    }

    sql += ` ORDER BY rank LIMIT 50;`;
    const rows = db.getAllSync(sql, params) as any[];
    return rows.map(mapRowToLink);
  } catch (e) {
    // Fallback to LIKE query if FTS syntax error
    let sql = `
      SELECT DISTINCT l.*
      FROM links l
      WHERE l.status != 'trash'
        AND (
          l.title LIKE ? OR
          l.description LIKE ? OR
          l.note LIKE ? OR
          l.url LIKE ? OR
          l.domain LIKE ?
        )
    `;
    const wildcard = `%${trimmed}%`;
    const params: any[] = [wildcard, wildcard, wildcard, wildcard, wildcard];

    if (filterType && filterType !== 'all') {
      sql += ` AND l.content_type = ?`;
      params.push(filterType);
    }

    sql += ` ORDER BY l.created_at DESC LIMIT 50;`;
    const rows = db.getAllSync(sql, params) as any[];
    return rows.map(mapRowToLink);
  }
}

export async function getRecentSearches(limit: number = 6): Promise<string[]> {
  const db = await getDatabase();
  if (db.isWeb) {
    const data = db.getData();
    return (data.searchHistory || []).map((sh: any) => sh.query).slice(0, limit);
  }

  const rows = db.getAllSync(
    `SELECT query FROM search_history ORDER BY searched_at DESC LIMIT ?;`,
    [limit]
  ) as any[];
  return rows.map((r) => r.query);
}

export async function addSearchQuery(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  const db = await getDatabase();
  const now = new Date().toISOString();

  if (db.isWeb) {
    db.saveData((prev: any) => {
      const existing = (prev.searchHistory || []).filter((s: any) => s.query.toLowerCase() !== trimmed.toLowerCase());
      return {
        ...prev,
        searchHistory: [{ id: 'sh-' + Date.now(), query: trimmed, searchedAt: now }, ...existing],
      };
    });
    return;
  }

  db.runSync(
    `INSERT INTO search_history (id, query, searched_at)
     VALUES (?, ?, ?)
     ON CONFLICT(query) DO UPDATE SET searched_at = ?;`,
    ['sh-' + Date.now(), trimmed, now, now]
  );
}

export async function clearSearchHistory(): Promise<void> {
  const db = await getDatabase();
  if (db.isWeb) {
    db.saveData((prev: any) => ({ ...prev, searchHistory: [] }));
    return;
  }
  db.runSync(`DELETE FROM search_history;`);
}

function mapRowToLink(row: any): Link {
  return {
    id: row.id,
    url: row.url,
    normalizedUrl: row.normalized_url,
    title: row.title,
    description: row.description || undefined,
    thumbnail: row.thumbnail || undefined,
    favicon: row.favicon || undefined,
    domain: row.domain,
    contentType: row.content_type,
    source: row.source || undefined,
    note: row.note || undefined,
    readingProgress: row.reading_progress,
    status: row.status,
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at || undefined,
  };
}
