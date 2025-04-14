const sql = `
-- No-op: SQLite does not support dropping columns directly.
-- Reverting this migration would require manual data rollback or table rebuild.
`

export default sql.trim()
