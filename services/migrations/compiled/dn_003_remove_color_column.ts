const sql = `
-- SQLite doesn't support DROP COLUMN, so we recreate the table without 'color'

CREATE TABLE collections_temp (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  field_order TEXT NOT NULL,
  fields TEXT NOT NULL,
  item_order TEXT NOT NULL,
  items TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);

INSERT INTO collections_temp (
  id, name, field_order, fields, item_order, items, created_at, updated_at
)
SELECT
  id, name, field_order, fields, item_order, items, created_at, updated_at
FROM collections;

DROP TABLE collections;

ALTER TABLE collections_temp RENAME TO collections;

-- Revert DB version to 2
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '2');
`

export default sql.trim()
