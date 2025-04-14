const sql = `
-- Meta table to track DB version
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  field_order TEXT NOT NULL,   -- JSON-encoded FieldId[]
  fields TEXT NOT NULL,        -- JSON-encoded Record<FieldId, Field>
  item_order TEXT NOT NULL,    -- JSON-encoded ItemId[]
  items TEXT NOT NULL,         -- JSON-encoded Record<ItemId, Item>
  created_at INTEGER NOT NULL, -- epoch ms
  updated_at INTEGER           -- epoch ms
);

-- Set initial DB version
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '1');
`

export default sql.trim()
