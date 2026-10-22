import Database from "better-sqlite3";

const db = new Database("social-poster.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS instagram_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ig_user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    container_id TEXT,
    media_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'published', 'failed')),
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("SQLite database connected");

export default db;
