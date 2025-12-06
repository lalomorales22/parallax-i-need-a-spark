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
      device_id TEXT UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      port INTEGER,
      role TEXT,
      status TEXT DEFAULT 'offline',
      personality TEXT,
      model TEXT,
      cpu_percent REAL,
      memory_percent REAL,
      gpu_info TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS personalities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      name TEXT NOT NULL,
      backstory TEXT,
      traits TEXT,
      voice_settings TEXT,
      system_prompt TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );

    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      size_mb REAL,
      local_path TEXT,
      download_date DATETIME,
      last_used DATETIME,
      is_active INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS network_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      metric_name TEXT,
      metric_value REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );

    -- Legacy history table for backward compatibility
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

// Device Management
export function upsertDevice(device: {
  device_id: string;
  name: string;
  address?: string;
  port?: number;
  role?: string;
  status?: string;
  personality?: string;
  model?: string;
  cpu_percent?: number;
  memory_percent?: number;
  gpu_info?: string;
}) {
  // Merge with defaults to ensure all named parameters are present
  const data = {
    address: null,
    port: null,
    role: 'unknown',
    status: 'offline',
    personality: '',
    model: '',
    cpu_percent: null,
    memory_percent: null,
    gpu_info: null,
    ...device
  };

  const stmt = db.prepare(`
    INSERT INTO devices (device_id, name, address, port, role, status, personality, model, cpu_percent, memory_percent, gpu_info, last_seen)
    VALUES (@device_id, @name, @address, @port, @role, @status, @personality, @model, @cpu_percent, @memory_percent, @gpu_info, CURRENT_TIMESTAMP)
    ON CONFLICT(device_id) DO UPDATE SET
      name = @name,
      address = @address,
      port = @port,
      role = @role,
      status = @status,
      personality = @personality,
      model = @model,
      cpu_percent = @cpu_percent,
      memory_percent = @memory_percent,
      gpu_info = @gpu_info,
      last_seen = CURRENT_TIMESTAMP
  `);
  stmt.run(data);
}

export function getAllDevices() {
  const stmt = db.prepare('SELECT * FROM devices ORDER BY last_seen DESC');
  return stmt.all();
}

export function getDevice(device_id: string) {
  const stmt = db.prepare('SELECT * FROM devices WHERE device_id = ?');
  return stmt.get(device_id);
}

export function updateDeviceStatus(device_id: string, status: string) {
  const stmt = db.prepare('UPDATE devices SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE device_id = ?');
  stmt.run(status, device_id);
}

// Personality Management
export function savePersonality(personality: {
  device_id: string;
  name: string;
  backstory?: string;
  traits?: string;
  voice_settings?: string;
  voice_style?: string;
  response_style?: string;
  system_prompt?: string;
}) {
  // Ensure the device exists first (to satisfy foreign key constraint)
  const existingDevice = db.prepare('SELECT device_id FROM devices WHERE device_id = ?').get(personality.device_id);
  if (!existingDevice) {
    // Create a minimal device entry
    const insertDevice = db.prepare(`
      INSERT INTO devices (device_id, name, role, status)
      VALUES (?, ?, 'local', 'online')
    `);
    insertDevice.run(personality.device_id, personality.name);
  }

  // Ensure all optional fields have default values to avoid named parameter errors
  // Handle both naming conventions from frontend (voice_style) and database (voice_settings)
  const data = {
    device_id: personality.device_id,
    name: personality.name,
    backstory: personality.backstory || '',
    traits: personality.traits || '',
    voice_settings: personality.voice_settings || personality.voice_style || '',
    system_prompt: personality.system_prompt || personality.response_style || ''
  };

  const stmt = db.prepare(`
    INSERT INTO personalities (device_id, name, backstory, traits, voice_settings, system_prompt, updated_at)
    VALUES (@device_id, @name, @backstory, @traits, @voice_settings, @system_prompt, CURRENT_TIMESTAMP)
  `);
  stmt.run(data);
}

export function getPersonality(device_id: string) {
  const stmt = db.prepare('SELECT * FROM personalities WHERE device_id = ? ORDER BY created_at DESC LIMIT 1');
  return stmt.get(device_id);
}

export function updatePersonality(id: number, updates: Partial<{
  name: string;
  backstory: string;
  traits: string;
  voice_settings: string;
  system_prompt: string;
}>) {
  const fields = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
  const stmt = db.prepare(`UPDATE personalities SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  stmt.run({ ...updates, id });
}

// Conversation Management
export function saveConversation(device_id: string, role: string, content: string) {
  const stmt = db.prepare('INSERT INTO conversations (device_id, role, content) VALUES (?, ?, ?)');
  stmt.run(device_id, role, content);
}

export function getConversations(device_id: string, limit: number = 50) {
  const stmt = db.prepare('SELECT * FROM conversations WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?');
  return stmt.all(device_id, limit);
}

export function clearConversations(device_id: string) {
  const stmt = db.prepare('DELETE FROM conversations WHERE device_id = ?');
  stmt.run(device_id);
}

// Model Management
export function saveModel(model: {
  model_id: string;
  name: string;
  size_mb?: number;
  local_path?: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO models (model_id, name, size_mb, local_path, download_date)
    VALUES (@model_id, @name, @size_mb, @local_path, CURRENT_TIMESTAMP)
    ON CONFLICT(model_id) DO UPDATE SET
      name = @name,
      size_mb = @size_mb,
      local_path = @local_path,
      download_date = CURRENT_TIMESTAMP
  `);
  stmt.run(model);
}

export function getModels() {
  const stmt = db.prepare('SELECT * FROM models ORDER BY download_date DESC');
  return stmt.all();
}

export function setActiveModel(model_id: string) {
  const deactivate = db.prepare('UPDATE models SET is_active = 0');
  deactivate.run();

  const activate = db.prepare('UPDATE models SET is_active = 1, last_used = CURRENT_TIMESTAMP WHERE model_id = ?');
  activate.run(model_id);
}

export function getActiveModel() {
  const stmt = db.prepare('SELECT * FROM models WHERE is_active = 1 LIMIT 1');
  return stmt.get();
}

// Network Stats
export function saveNetworkStat(device_id: string, metric_name: string, metric_value: number) {
  const stmt = db.prepare('INSERT INTO network_stats (device_id, metric_name, metric_value) VALUES (?, ?, ?)');
  stmt.run(device_id, metric_name, metric_value);
}

export function getNetworkStats(device_id: string, metric_name: string, limit: number = 100) {
  const stmt = db.prepare('SELECT * FROM network_stats WHERE device_id = ? AND metric_name = ? ORDER BY timestamp DESC LIMIT ?');
  return stmt.all(device_id, metric_name, limit);
}

export default db;
