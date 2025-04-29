import * as SQLite from "expo-sqlite"

// Import compiled migration files as strings
import up_001 from "./compiled/up_001_initial_schema"

type Migration = {
  version: number
  name: string
  sql: string
}

const MIGRATIONS: Migration[] = [
  { version: 1, name: "initial_schema", sql: up_001 },
]

async function getDatabaseVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    console.log("[DB] Checking for meta key...")
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'db_version'",
    )
    console.log("[DB] Found db_version meta row:", result)

    return result ? parseInt(result.value, 10) : 0
  } catch (_err) {
    // Meta table doesn't exist yet
    return 0
  }
}

async function setDatabaseVersion(
  db: SQLite.SQLiteDatabase,
  version: number,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
    "db_version",
    version.toString(),
  )
}

export async function migrateDatabase(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const currentVersion = await getDatabaseVersion(db)

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(
        `[DB] Running migration: up_${String(migration.version).padStart(
          3,
          "0",
        )}_${migration.name}`,
      )

      const statements = migration.sql
        .split(";")
        .map(s => s.trim())
        .filter(Boolean)

      for (const stmt of statements) {
        try {
          console.log(`[DB] Executing statement:\n${stmt}`)
          await db.execAsync(stmt)
        } catch (err) {
          console.error("[DB] Failed to execute statement:", stmt)
          console.error(err)
          throw err
        }
      }

      await setDatabaseVersion(db, migration.version)
    }
  }
}
