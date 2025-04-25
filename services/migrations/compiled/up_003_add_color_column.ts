const sql = `
-- Add 'color' column to collections table
ALTER TABLE collections ADD COLUMN color TEXT;

-- Update DB version to 3
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '3');
`

export default sql.trim()
