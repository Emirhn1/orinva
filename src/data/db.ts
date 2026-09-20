import * as SQLite from 'expo-sqlite';

// A project-specific file name — avoids colliding with another Expo Go
// project's local database on the same device/simulator.
export const db = SQLite.openDatabaseSync('orinva-mobile-v1.db');

const SCHEMA_VERSION = 1;

const TABLE_NAMES = ['behaviors', 'events', 'journal_entries', 'reasons', 'checkins', 'milestones', 'kv_settings'];

function schemaLooksStale(): boolean {
  try {
    const row = db.getFirstSync<{ cnt: number }>(
      "SELECT count(*) as cnt FROM pragma_table_info('events') WHERE name = 'startedAt';"
    );
    const eventsTableExists = db.getFirstSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='events';"
    );
    if (eventsTableExists && (!row || row.cnt === 0)) return true;
    return false;
  } catch {
    return true;
  }
}

export function initDb() {
  db.execSync('PRAGMA journal_mode = WAL;');

  if (schemaLooksStale()) {
    for (const table of TABLE_NAMES) {
      db.execSync(`DROP TABLE IF EXISTS ${table};`);
    }
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS behaviors (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      goalMode TEXT NOT NULL,
      unit TEXT NOT NULL,
      costPerUnit REAL,
      costCurrency TEXT,
      planAlternative TEXT,
      createdAt TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      cleanSinceAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      behaviorId TEXT NOT NULL,
      kind TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      intensity INTEGER,
      mood TEXT,
      contextTags TEXT NOT NULL DEFAULT '[]',
      note TEXT,
      outcome TEXT,
      helpedByPlan TEXT
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt TEXT NOT NULL,
      text TEXT NOT NULL,
      linkedEventId TEXT,
      tag TEXT
    );

    CREATE TABLE IF NOT EXISTS reasons (
      id TEXT PRIMARY KEY NOT NULL,
      behaviorId TEXT,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      skipped INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY NOT NULL,
      behaviorId TEXT NOT NULL,
      label TEXT NOT NULL,
      thresholdHours REAL NOT NULL,
      reachedAt TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS kv_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  db.execSync(`INSERT OR IGNORE INTO kv_settings (key, value) VALUES ('schemaVersion', '${SCHEMA_VERSION}');`);
}

export function wipeAllTables() {
  db.execSync(`
    DELETE FROM behaviors;
    DELETE FROM events;
    DELETE FROM journal_entries;
    DELETE FROM reasons;
    DELETE FROM checkins;
    DELETE FROM milestones;
    DELETE FROM kv_settings;
  `);
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    behaviors: db.getAllSync('SELECT * FROM behaviors;'),
    events: db.getAllSync('SELECT * FROM events;'),
    journalEntries: db.getAllSync('SELECT * FROM journal_entries;'),
    reasons: db.getAllSync('SELECT * FROM reasons;'),
    checkins: db.getAllSync('SELECT * FROM checkins;'),
    milestones: db.getAllSync('SELECT * FROM milestones;'),
  };
}
