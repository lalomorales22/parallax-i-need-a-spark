import Database from 'better-sqlite3';
import path from 'path';
import isDev from 'electron-is-dev';
import { app } from 'electron';

const dbPath = isDev
  ? path.join(app.getAppPath(), 'spark.db')
  : path.join(app.getPath('userData'), 'spark.db');

const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      status TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Seed default settings if not exist
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  if (!stmt.get('assistant_name')) {
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insert.run('assistant_name', 'Spark');
    insert.run('theme_color', '#00ffcc');
  }
}

export function getSetting(key: string) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const row = stmt.get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function saveSetting(key: string, value: string) {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run(key, value);
}

export default db;
