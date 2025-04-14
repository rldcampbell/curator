-- Use strftime('%s', 'now') to get current time in seconds
-- Multiply by 1000 to convert to epoch milliseconds

-- Backfill missing createdAt for collections
UPDATE collections
SET createdAt = strftime('%s', 'now') * 1000
WHERE createdAt IS NULL;

-- Backfill missing createdAt for items
UPDATE items
SET createdAt = strftime('%s', 'now') * 1000
WHERE createdAt IS NULL;

-- Update DB version to 2
INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', '2');
