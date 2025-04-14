-- Meta table to track DB version
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  fieldOrder TEXT NOT NULL, -- JSON-encoded FieldId[]
  fields TEXT NOT NULL,     -- JSON-encoded Record<FieldId, Field>
  itemOrder TEXT NOT NULL,  -- JSON-encoded ItemId[]
  createdAt INTEGER NOT NULL, -- epoch ms
  updatedAt INTEGER           -- epoch ms
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY NOT NULL,
  collectionId TEXT NOT NULL,
  item TEXT NOT NULL,         -- JSON-encoded Item
  createdAt INTEGER NOT NULL, -- epoch ms
  updatedAt INTEGER,          -- epoch ms
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
);

-- Set initial DB version
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '1');
