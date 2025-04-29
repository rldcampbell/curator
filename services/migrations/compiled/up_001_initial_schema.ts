const sql = `
-- Create meta table
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  sortOrder INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Create fields table
CREATE TABLE IF NOT EXISTS fields (
  id TEXT PRIMARY KEY,
  collectionId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON
  sortOrder INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  collectionId TEXT NOT NULL,
  tags TEXT, -- optional comma-separated tags
  sortOrder INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
);

-- Create item_values table
CREATE TABLE IF NOT EXISTS item_values (
  itemId TEXT NOT NULL,
  fieldId TEXT NOT NULL,
  value TEXT,
  PRIMARY KEY (itemId, fieldId),
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (fieldId) REFERENCES fields(id) ON DELETE CASCADE
);

-- Set DB version to 1
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '1');
`

export default sql.trim()
