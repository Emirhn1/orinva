import * as SQLite from 'expo-sqlite';

// A project-specific file name — avoids colliding with another Expo Go
// project's local database on the same device/simulator.
const DATABASE_NAME = 'orinva-mobile-v1.db';
const MIGRATION_BACKUP_NAME = 'orinva-mobile-v1.migration-backup.db';

export const db = SQLite.openDatabaseSync(DATABASE_NAME);

const SCHEMA_VERSION = 8;

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
function migrateToV1() {
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
      kind TEXT NOT NULL DEFAULT 'urge',
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
}

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
  addColumnIfMissing('behaviors', 'dailyTarget', 'REAL');

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

function migrateToV3() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_quotes (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL,
      text TEXT NOT NULL,
      author TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_meta (
      quoteId TEXT PRIMARY KEY NOT NULL,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      lastShownAt TEXT,
      shownCount INTEGER NOT NULL DEFAULT 0,
      hiddenAt TEXT
    );
  `);
}

function migrateToV4() {
  // Version checkpoint for databases created by the previous schema manager.
}

function migrateToV5() {
  addColumnIfMissing('behaviors', 'verb_urge', "TEXT NOT NULL DEFAULT 'Canım çekti'");
  addColumnIfMissing('behaviors', 'verb_resist', "TEXT NOT NULL DEFAULT 'Direndim'");
  addColumnIfMissing('behaviors', 'verb_did', "TEXT NOT NULL DEFAULT 'Yaptım'");
  addColumnIfMissing('behaviors', 'needs_name_review', 'INTEGER NOT NULL DEFAULT 0');

  if (!tableExists('behaviors')) return;

  const verbRows = db.getAllSync<{ id: string; category: string }>('SELECT id, category FROM behaviors;');
  for (const row of verbRows) {
    const verbs = verbsForCategory(row.category);
    db.runSync('UPDATE behaviors SET verb_urge = ?, verb_resist = ?, verb_did = ? WHERE id = ?;', [verbs.urge, verbs.resist, verbs.did, row.id]);
  }

  migrateLegacyBehaviorNames();
}

function migrateToV6() {
  addColumnIfMissing('behaviors', 'color', "TEXT NOT NULL DEFAULT 'indigo'");
  addColumnIfMissing('behaviors', 'icon', "TEXT NOT NULL DEFAULT 'edit-3'");
  if (!tableExists('behaviors')) return;
  const rows = db.getAllSync<{ id: string; category: string }>('SELECT id, category FROM behaviors;');
  const appearance: Record<string, [string, string]> = {
    nicotine: ['amber', 'zap'], social_media: ['indigo', 'grid'], sugar: ['violet', 'heart'],
    alcohol: ['slateBlue', 'droplet'], gambling: ['bronze', 'dollar-sign'], caffeine: ['navy', 'coffee'],
    gaming: ['cyan', 'monitor'], custom: ['success', 'edit-3'],
  };
  for (const row of rows) {
    const [color, icon] = appearance[row.category] ?? ['indigo', 'edit-3'];
    db.runSync('UPDATE behaviors SET color = ?, icon = ? WHERE id = ?;', [color, icon, row.id]);
  }
}

function migrateToV7() {
  if (tableExists('behaviors') && hasColumn('behaviors', 'color')) {
    db.runSync("UPDATE behaviors SET color = 'navy' WHERE color = 'terracotta';");
  }
}

/** Optional guided-reflection fields on journal entries, plus a draft flag so a reflection can be saved and continued later. */
function migrateToV8() {
  addColumnIfMissing('journal_entries', 'situation', 'TEXT');
  addColumnIfMissing('journal_entries', 'thought', 'TEXT');
  addColumnIfMissing('journal_entries', 'reframe', 'TEXT');
  addColumnIfMissing('journal_entries', 'isDraft', 'INTEGER NOT NULL DEFAULT 0');
}

function verbsForCategory(category: string): { urge: string; resist: string; did: string } {
  switch (category) {
    case 'social_media':
      return { urge: 'Elim gitti', resist: 'Direndim', did: 'Girdim' };
    case 'sugar':
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'Yedim' };
    case 'alcohol':
    case 'caffeine':
    case 'nicotine':
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'İçtim' };
    case 'gambling':
    case 'gaming':
      return { urge: category === 'gaming' ? 'Elim gitti' : 'Canım çekti', resist: 'Direndim', did: 'Oynadım' };
    default:
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'Yaptım' };
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  nicotine: 'Sigara / Nikotin',
  social_media: 'Telefon / Sosyal medya',
  sugar: 'Şeker / abur cubur',
  alcohol: 'Alkol',
  gambling: 'Kumar / bahis',
  caffeine: 'Kafein',
  gaming: 'Oyun',
  custom: 'Kendi davranışım',
};

function shortTurkishDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Eski kayıt';
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function migrateLegacyBehaviorNames() {
  const rows = db.getAllSync<{ id: string; name: string; category: string; createdAt: string }>(
    'SELECT id, name, category, createdAt FROM behaviors ORDER BY createdAt ASC;'
  );
  const seen = new Set<string>();

  for (const row of rows) {
    const label = CATEGORY_LABELS[row.category] ?? 'Davranışım';
    const current = (row.name ?? '').trim();
    const normalized = current.toLocaleLowerCase('tr-TR');
    const generatedBefore = !current || current === label || current === 'Davranışım';
    const duplicate = !!current && seen.has(normalized);

    if (!generatedBefore && !duplicate) {
      seen.add(normalized);
      continue;
    }

    const base = `${label} · ${shortTurkishDate(row.createdAt)}`;
    let candidate = base;
    let suffix = 2;
    while (seen.has(candidate.toLocaleLowerCase('tr-TR'))) candidate = `${base} · ${suffix++}`;
    db.runSync('UPDATE behaviors SET name = ?, needs_name_review = 1 WHERE id = ?;', [candidate, row.id]);
    seen.add(candidate.toLocaleLowerCase('tr-TR'));
  }
}

const MIGRATIONS: Record<number, () => void> = {
  1: migrateToV1,
  2: migrateToV2,
  3: migrateToV3,
  4: migrateToV4,
  5: migrateToV5,
  6: migrateToV6,
  7: migrateToV7,
  8: migrateToV8,
};

function currentSchemaVersion(): number {
  return db.getFirstSync<{ user_version: number }>('PRAGMA user_version;')?.user_version ?? 0;
}

function runMigrations() {
  const from = currentSchemaVersion();
  if (from > SCHEMA_VERSION) throw new Error(`Veritabanı sürümü desteklenmiyor: ${from}`);
  if (from === SCHEMA_VERSION) return;

  try {
    SQLite.deleteDatabaseSync(MIGRATION_BACKUP_NAME);
  } catch {}
  const backup = SQLite.openDatabaseSync(MIGRATION_BACKUP_NAME);
  SQLite.backupDatabaseSync({ sourceDatabase: db, destDatabase: backup });

  try {
    db.execSync('BEGIN IMMEDIATE;');
    for (let version = from + 1; version <= SCHEMA_VERSION; version++) {
      const migrate = MIGRATIONS[version];
      if (!migrate) throw new Error(`Eksik migrasyon adımı: v${version}`);
      migrate();
      db.execSync(`PRAGMA user_version = ${version};`);
    }
    db.execSync('COMMIT;');
    backup.closeSync();
    SQLite.deleteDatabaseSync(MIGRATION_BACKUP_NAME);
  } catch (error) {
    try {
      db.execSync('ROLLBACK;');
    } catch {}
    SQLite.backupDatabaseSync({ sourceDatabase: backup, destDatabase: db });
    backup.closeSync();
    throw new Error('Veritabanı migrasyonu başarısız oldu; yedek geri yüklendi.', { cause: error });
  }
}

export function initDb() {
  db.execSync('PRAGMA journal_mode = WAL;');
  runMigrations();
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
    DELETE FROM user_quotes;
    DELETE FROM quote_meta;
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
    userQuotes: db.getAllSync('SELECT * FROM user_quotes;'),
    quoteMeta: db.getAllSync('SELECT * FROM quote_meta;'),
  };
}
