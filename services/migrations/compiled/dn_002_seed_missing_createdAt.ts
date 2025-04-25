const sql = `
-- No-op: can't remove created_at timestamps without knowing old values

-- But revert DB version back to 1
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '1');
`

export default sql.trim()
