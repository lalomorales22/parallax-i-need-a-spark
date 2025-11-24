import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

describe('Database Operations', () => {
  const testDbPath = path.join(__dirname, 'test.db');
  let db: Database.Database;

  beforeEach(() => {
    // Create a test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);

    // Create settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should insert and retrieve settings', () => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run('test_key', 'test_value');

    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('test_key') as { value: string };
    expect(row.value).toBe('test_value');
  });

  it('should update existing settings', () => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run('test_key', 'initial_value');
    stmt.run('test_key', 'updated_value');

    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('test_key') as { value: string };
    expect(row.value).toBe('updated_value');
  });

  it('should return undefined for non-existent keys', () => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('non_existent_key');
    expect(row).toBeUndefined();
  });
});
