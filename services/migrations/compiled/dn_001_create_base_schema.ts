const sql = `
-- Drop collections table
DROP TABLE IF EXISTS collections;

-- Drop meta table
DROP TABLE IF EXISTS meta;

-- No db_version reset possible — meta table no longer exists
`

export default sql.trim()
