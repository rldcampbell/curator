import * as FileSystem from "expo-file-system"
import * as SQLite from "expo-sqlite"

const MIGRATIONS_DIR = FileSystem.documentDirectory + "migrations/"

// Reads and executes a .sql file one statement at a time
async function runSqlFile(
  db: SQLite.SQLiteDatabase,
  path: string,
): Promise<void> {
  const sql = await FileSystem.readAsStringAsync(path)
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(Boolean)

  for (const stmt of statements) {
    await db.execAsync(stmt + ";")
  }
}

async function getDatabaseVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'db_version'",
    )
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

// Runs all pending migrations in alphabetical order
export async function migrateDatabase(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const currentVersion = await getDatabaseVersion(db)

  const allFiles = await FileSystem.readDirectoryAsync(MIGRATIONS_DIR)
  const upFiles = allFiles.filter(f => f.startsWith("up_")).sort()

  for (const file of upFiles) {
    const match = file.match(/^up_(\d+)_/)
    if (!match) continue
    const version = parseInt(match[1])
    if (version > currentVersion) {
      console.log(`[DB] Running migration: ${file}`)
      await runSqlFile(db, MIGRATIONS_DIR + file)
      await setDatabaseVersion(db, version)
    }
  }
}
