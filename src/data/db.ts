import * as SQLite from 'expo-sqlite';

// A project-specific file name — avoids colliding with another Expo Go
// project's local database on the same device/simulator.
export const db = SQLite.openDatabaseSync('orinva-mobile-v1.db');

const SCHEMA_VERSION = 2;

const TABLE_NAMES = ['behaviors', 'events', 'journal_entries', 'reasons', 'checkins', 'milestones', 'kv_settings'];

function hasColumn(table: string, column: string): boolean {
  const row = db.getFirstSync<{ cnt: number }>(
    `SELECT count(*) as cnt FROM pragma_table_info('${table}') WHERE name = '${column}';`
  );
  return !!row && row.cnt > 0;
}

function tableExists(table: string): boolean {
  const row = db.getFirstSync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`
  );
  return !!row;
}

function schemaLooksStale(): boolean {
  try {
    if (tableExists('events') && !hasColumn('events', 'startedAt')) return true;
    return false;
  } catch {
    return true;
  }
}

/** Adds a column if it's missing — safe to call on every boot. */
function addColumnIfMissing(table: string, column: string, definition: string) {
  if (!tableExists(table)) return;
  if (hasColumn(table, column)) return;
  db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
}

/**
 * v1 → v2: H5 model split (event = urge, outcome = result), richer context
 * chips (triggers/location/company), delay timer + wave mode measurements,
 * entry-point tracking, and the earnings counter fields on behaviors.
 */
function migrateToV2() {
  addColumnIfMissing('events', 'intensityAfter', 'INTEGER');
  addColumnIfMissing('events', 'location', 'TEXT');
  addColumnIfMissing('events', 'company', 'TEXT');
  addColumnIfMissing('events', 'outcomeUpdatedAt', 'TEXT');
  addColumnIfMissing('events', 'delaySeconds', 'INTEGER');
  addColumnIfMissing('events', 'source', "TEXT NOT NULL DEFAULT 'app'");

  addColumnIfMissing('behaviors', 'minutesPerUnit', 'REAL');
  addColumnIfMissing('behaviors', 'baselinePerDay', 'REAL');
  addColumnIfMissing('behaviors', 'savingsGoalLabel', 'TEXT');
  addColumnIfMissing('behaviors', 'savingsGoalAmount', 'REAL');

  addColumnIfMissing('journal_entries', 'mood', 'TEXT');

  if (tableExists('events') && hasColumn('events', 'kind')) {
    // Old rows: kind carried the outcome. Fold it into `outcome` and normalise `passed` → `resisted`.
    db.execSync(`
      UPDATE events SET outcome = 'resisted' WHERE outcome = 'passed';
      UPDATE events SET outcome = 'resisted', outcomeUpdatedAt = startedAt WHERE kind = 'resisted' AND outcome IS NULL;
      UPDATE events SET outcome = 'acted', outcomeUpdatedAt = startedAt WHERE kind = 'acted' AND outcome IS NULL;
      UPDATE events SET kind = 'urge';
    `);
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
      minutesPerUnit REAL,
      baselinePerDay REAL,
      savingsGoalLabel TEXT,
      savingsGoalAmount REAL,
      planAlternative TEXT,
      createdAt TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      cleanSinceAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      behaviorId TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'urge',
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      intensity INTEGER,
      intensityAfter INTEGER,
      mood TEXT,
      contextTags TEXT NOT NULL DEFAULT '[]',
      location TEXT,
      company TEXT,
      note TEXT,
      outcome TEXT,
      outcomeUpdatedAt TEXT,
      delaySeconds INTEGER,
      helpedByPlan TEXT,
      source TEXT NOT NULL DEFAULT 'app'
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt TEXT NOT NULL,
      text TEXT NOT NULL,
      linkedEventId TEXT,
      tag TEXT,
      mood TEXT
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

  migrateToV2();

  db.runSync(`INSERT OR REPLACE INTO kv_settings (key, value) VALUES ('schemaVersion', ?);`, [String(SCHEMA_VERSION)]);
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
    schemaVersion: SCHEMA_VERSION,
    behaviors: db.getAllSync('SELECT * FROM behaviors;'),
    events: db.getAllSync('SELECT * FROM events;'),
    journalEntries: db.getAllSync('SELECT * FROM journal_entries;'),
    reasons: db.getAllSync('SELECT * FROM reasons;'),
    checkins: db.getAllSync('SELECT * FROM checkins;'),
    milestones: db.getAllSync('SELECT * FROM milestones;'),
  };
}
