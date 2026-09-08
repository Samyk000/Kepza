export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT 'yellow',
  parent_id TEXT,
  is_default INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  favicon TEXT,
  domain TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'website',
  source TEXT,
  note TEXT,
  reading_progress INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'inbox',
  is_pinned INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_opened_at TEXT
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT
);

CREATE TABLE IF NOT EXISTS link_collections (
  link_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (link_id, collection_id),
  FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS link_tags (
  link_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (link_id, tag_id),
  FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_history (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  searched_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_status ON links (status);
CREATE INDEX IF NOT EXISTS idx_links_created ON links (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_last_opened ON links (last_opened_at DESC);
`;

export const CREATE_FTS_SQL = `
CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
  title,
  description,
  note,
  url,
  domain,
  content='links',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS links_ai AFTER INSERT ON links BEGIN
  INSERT INTO links_fts(rowid, title, description, note, url, domain)
  VALUES (new.rowid, new.title, new.description, new.note, new.url, new.domain);
END;

CREATE TRIGGER IF NOT EXISTS links_ad AFTER DELETE ON links BEGIN
  INSERT INTO links_fts(links_fts, rowid, title, description, note, url, domain)
  VALUES('delete', old.rowid, old.title, old.description, old.note, old.url, old.domain);
END;

CREATE TRIGGER IF NOT EXISTS links_au AFTER UPDATE ON links BEGIN
  INSERT INTO links_fts(links_fts, rowid, title, description, note, url, domain)
  VALUES('delete', old.rowid, old.title, old.description, old.note, old.url, old.domain);
  INSERT INTO links_fts(rowid, title, description, note, url, domain)
  VALUES (new.rowid, new.title, new.description, new.note, new.url, new.domain);
END;
`;
