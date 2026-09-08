import { getDatabase } from '../client';
import { Link, LinkCreateInput, LinkStatus, LinkUpdateInput, ContentType } from '../../types/link';

export async function getAllLinks(options?: {
  status?: LinkStatus;
  contentType?: ContentType | 'all';
  collectionId?: string;
  limit?: number;
}): Promise<Link[]> {
  const db = await getDatabase();

  if (db.isWeb) {
    const data = db.getData();
    let result: Link[] = [...data.links];

    if (options?.status) {
      result = result.filter((l) => l.status === options.status);
    } else {
      result = result.filter((l) => l.status !== 'trash');
    }
    if (options?.contentType && options.contentType !== 'all') {
      result = result.filter((l) => l.contentType === options.contentType);
    }
    if (options?.collectionId) {
      if (options.collectionId === 'col-all') {
        // All links
      } else {
        const linkIdsInCol = new Set(
          data.linkCollections
            .filter((lc: any) => lc.collectionId === options.collectionId)
            .map((lc: any) => lc.linkId)
        );
        result = result.filter((l) => linkIdsInCol.has(l.id) || (l as any).collectionId === options.collectionId);
      }
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result.map((l) => ({
      ...l,
      collectionIds: data.linkCollections
        .filter((lc: any) => lc.linkId === l.id)
        .map((lc: any) => lc.collectionId),
    }));
  }

  // Native SQLite
  let query = `
    SELECT DISTINCT l.*
    FROM links l
  `;
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (options?.collectionId && options.collectionId !== 'col-all') {
    query += ` JOIN link_collections lc ON l.id = lc.link_id `;
    whereClauses.push(`lc.collection_id = ?`);
    params.push(options.collectionId);
  }

  if (options?.status) {
    whereClauses.push(`l.status = ?`);
    params.push(options.status);
  } else {
    whereClauses.push(`l.status != 'trash'`);
  }

  if (options?.contentType && options.contentType !== 'all') {
    whereClauses.push(`l.content_type = ?`);
    params.push(options.contentType);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  query += ` ORDER BY l.created_at DESC`;

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  const rows = db.getAllSync(query, params) as any[];
  return rows.map(mapRowToLink);
}

export async function getLinkById(id: string): Promise<Link | null> {
  const db = await getDatabase();

  if (db.isWeb) {
    const data = db.getData();
    const found = data.links.find((l: Link) => l.id === id);
    if (!found) return null;
    return {
      ...found,
      collectionIds: data.linkCollections
        .filter((lc: any) => lc.linkId === id)
        .map((lc: any) => lc.collectionId),
    };
  }

  const row = db.getFirstSync(`SELECT * FROM links WHERE id = ?;`, [id]) as any;
  if (!row) return null;

  const colRows = db.getAllSync(
    `SELECT collection_id FROM link_collections WHERE link_id = ?;`,
    [id]
  ) as any[];

  return {
    ...mapRowToLink(row),
    collectionIds: colRows.map((c) => c.collection_id),
  };
}

export async function createLink(input: LinkCreateInput): Promise<Link> {
  const db = await getDatabase();
  const id = 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  let domain = input.domain;
  if (!domain && input.url) {
    try {
      domain = new URL(input.url).hostname.replace('www.', '');
    } catch {
      domain = 'web';
    }
  }

  const newLink: Link = {
    id,
    url: input.url,
    normalizedUrl: input.url.trim().toLowerCase(),
    title: input.title || domain || 'Saved Link',
    description: input.description,
    thumbnail: input.thumbnail,
    favicon: input.favicon || `https://icon.horse/icon/${domain}`,
    domain: domain || 'web',
    contentType: input.contentType || 'website',
    source: input.source,
    note: input.note,
    readingProgress: 0,
    status: input.status || (input.collectionIds && input.collectionIds.length > 0 ? 'organized' : 'inbox'),
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    collectionIds: input.collectionIds || [],
  };

  if (db.isWeb) {
    db.saveData((prev: any) => ({
      ...prev,
      links: [newLink, ...prev.links],
      linkCollections: [
        ...prev.linkCollections,
        ...(input.collectionIds || []).map((cid) => ({
          linkId: id,
          collectionId: cid,
          addedAt: now,
        })),
      ],
    }));
    return newLink;
  }

  db.runSync(
    `INSERT INTO links (id, url, normalized_url, title, description, thumbnail, favicon, domain, content_type, source, note, reading_progress, status, is_pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      newLink.id,
      newLink.url,
      newLink.normalizedUrl,
      newLink.title,
      newLink.description || null,
      newLink.thumbnail || null,
      newLink.favicon || null,
      newLink.domain,
      newLink.contentType,
      newLink.source || null,
      newLink.note || null,
      0,
      newLink.status,
      0,
      now,
      now,
    ]
  );

  if (input.collectionIds) {
    for (const cid of input.collectionIds) {
      db.runSync(
        `INSERT OR IGNORE INTO link_collections (link_id, collection_id, added_at) VALUES (?, ?, ?);`,
        [id, cid, now]
      );
    }
  }

  return newLink;
}

export async function updateLink(id: string, input: LinkUpdateInput): Promise<Link | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  if (db.isWeb) {
    let updated: Link | null = null;
    db.saveData((prev: any) => {
      const idx = prev.links.findIndex((l: Link) => l.id === id);
      if (idx === -1) return prev;

      const current = prev.links[idx];
      let domain = current.domain;
      let normalizedUrl = current.normalizedUrl;
      if (input.url) {
        normalizedUrl = input.url.trim().toLowerCase();
        try {
          domain = new URL(input.url).hostname.replace('www.', '');
        } catch {}
      }

      updated = {
        ...current,
        ...input,
        ...(input.url ? { domain, normalizedUrl } : {}),
        updatedAt: now,
      };

      const newLinks = [...prev.links];
      newLinks[idx] = updated;

      let newLinkCollections = prev.linkCollections;
      if (input.collectionIds) {
        newLinkCollections = prev.linkCollections.filter((lc: any) => lc.linkId !== id);
        for (const cid of input.collectionIds) {
          newLinkCollections.push({ linkId: id, collectionId: cid, addedAt: now });
        }
      }

      return {
        ...prev,
        links: newLinks,
        linkCollections: newLinkCollections,
      };
    });
    return updated;
  }

  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [now];

  if (input.url !== undefined) {
    updates.push('url = ?');
    params.push(input.url);
    updates.push('normalized_url = ?');
    params.push(input.url.trim().toLowerCase());
    try {
      const d = new URL(input.url).hostname.replace('www.', '');
      updates.push('domain = ?');
      params.push(d);
    } catch {}
  }
  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description);
  }
  if (input.thumbnail !== undefined) {
    updates.push('thumbnail = ?');
    params.push(input.thumbnail);
  }
  if (input.note !== undefined) {
    updates.push('note = ?');
    params.push(input.note);
  }
  if (input.readingProgress !== undefined) {
    updates.push('reading_progress = ?');
    params.push(input.readingProgress);
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
  }
  if (input.isPinned !== undefined) {
    updates.push('is_pinned = ?');
    params.push(input.isPinned ? 1 : 0);
  }
  if (input.lastOpenedAt !== undefined) {
    updates.push('last_opened_at = ?');
    params.push(input.lastOpenedAt);
  }

  params.push(id);
  db.runSync(`UPDATE links SET ${updates.join(', ')} WHERE id = ?;`, params);

  if (input.collectionIds) {
    db.runSync(`DELETE FROM link_collections WHERE link_id = ?;`, [id]);
    for (const cid of input.collectionIds) {
      db.runSync(
        `INSERT OR IGNORE INTO link_collections (link_id, collection_id, added_at) VALUES (?, ?, ?);`,
        [id, cid, now]
      );
    }
  }

  return getLinkById(id);
}

export async function deleteLink(id: string, permanent: boolean = false): Promise<boolean> {
  const db = await getDatabase();

  if (permanent) {
    if (db.isWeb) {
      db.saveData((prev: any) => ({
        ...prev,
        links: prev.links.filter((l: Link) => l.id !== id),
        linkCollections: prev.linkCollections.filter((lc: any) => lc.linkId !== id),
      }));
      return true;
    }
    db.runSync(`DELETE FROM links WHERE id = ?;`, [id]);
    return true;
  }

  // Soft delete -> move to trash
  await updateLink(id, { status: 'trash' });
  return true;
}

export async function getContinueLinks(limit: number = 5): Promise<Link[]> {
  const db = await getDatabase();
  if (db.isWeb) {
    const data = db.getData();
    return data.links
      .filter((l: Link) => l.status !== 'trash' && l.status !== 'archived')
      .filter((l: Link) => (l.readingProgress && l.readingProgress > 0) || l.lastOpenedAt)
      .sort((a: Link, b: Link) => {
        const timeA = new Date(a.lastOpenedAt || a.updatedAt).getTime();
        const timeB = new Date(b.lastOpenedAt || b.updatedAt).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  const rows = db.getAllSync(
    `SELECT * FROM links
     WHERE status NOT IN ('trash', 'archived')
       AND (reading_progress > 0 OR last_opened_at IS NOT NULL)
     ORDER BY COALESCE(last_opened_at, updated_at) DESC
     LIMIT ?;`,
    [limit]
  ) as any[];

  return rows.map(mapRowToLink);
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
