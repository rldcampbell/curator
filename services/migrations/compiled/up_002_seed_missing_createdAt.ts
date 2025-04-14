const sql = `
-- Use strftime('%s', 'now') to get current time in seconds
-- Multiply by 1000 to convert to epoch milliseconds

-- Backfill missing created_at for collections
UPDATE collections
SET created_at = strftime('%s', 'now') * 1000
WHERE created_at IS NULL;

-- Update DB version to 2
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '2');
`

export default sql.trim()
