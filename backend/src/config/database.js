import Database from "better-sqlite3";

const db = new Database("social-poster.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS instagram_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ig_user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT,
    token_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ig_user_id TEXT,
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    container_id TEXT,
    media_id TEXT,
    permalink TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'published', 'failed')),
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migration helper to add missing columns to existing tables
const addColumnIfNotExists = (tableName, columnName, columnDefinition) => {
  const columns = db.pragma(`table_info(${tableName})`);
  const exists = columns.some((col) => col.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
};

addColumnIfNotExists("instagram_accounts", "access_token", "TEXT");
addColumnIfNotExists("instagram_accounts", "token_expires_at", "DATETIME");
addColumnIfNotExists("instagram_accounts", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
addColumnIfNotExists("posts", "ig_user_id", "TEXT");
addColumnIfNotExists("posts", "permalink", "TEXT");

console.log("SQLite database connected and migrations applied");

export default db;
