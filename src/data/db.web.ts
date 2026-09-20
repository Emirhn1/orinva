/**
 * Web-only fallback for src/data/db.ts.
 *
 * expo-sqlite's web implementation needs SharedArrayBuffer, which browsers
 * only expose in a cross-origin-isolated context — something Expo's web dev
 * server doesn't set up by default. Since ORINVA is a mobile-first, local-first
 * app (web is a preview convenience, not a shipping target), this file swaps
 * in a tiny in-memory engine that understands exactly the SQL shapes our
 * repositories issue, so the app renders and behaves normally in a browser
 * tab. Nothing here persists across a page reload — that's expected on web.
 *
 * Metro/Expo picks this file automatically for web builds because it matches
 * `db.web.ts` over `db.ts`; no platform branching needed elsewhere.
 */

type Row = Record<string, any>;

const tables: Record<string, Map<string, Row>> = {};

function ensureTable(name: string) {
  if (!tables[name]) tables[name] = new Map();
  return tables[name];
}

function keyField(table: string) {
  return table === 'kv_settings' ? 'key' : table === 'quote_meta' ? 'quoteId' : 'id';
}

function runStatement(rawStatement: string) {
  const stmt = rawStatement.trim();
  if (!stmt) return;

  let m: RegExpMatchArray | null;

  if (/^PRAGMA/i.test(stmt)) return;

  // Migrations are SQLite-only concerns; the in-memory web engine is schemaless.
  if (/^ALTER TABLE/i.test(stmt)) return;
  if (/^UPDATE\s+\w+\s+SET/i.test(stmt)) return;

  if ((m = stmt.match(/^CREATE TABLE IF NOT EXISTS\s+(\w+)/i))) {
    ensureTable(m[1]);
    return;
  }

  if ((m = stmt.match(/^DROP TABLE IF EXISTS\s+(\w+)/i))) {
    delete tables[m[1]];
    return;
  }

  if ((m = stmt.match(/^DELETE FROM\s+(\w+)\s*$/i))) {
    ensureTable(m[1]).clear();
    return;
  }

  if ((m = stmt.match(/^INSERT OR IGNORE INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i))) {
    const table = ensureTable(m[1]);
    const cols = m[2].split(',').map((c) => c.trim());
    const vals = m[3].split(',').map((v) => v.trim().replace(/^'(.*)'$/, '$1'));
    const row: Row = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    const key = row[keyField(m[1])];
    if (!table.has(key)) table.set(key, row);
    return;
  }

  // Anything else that reaches here in an execSync() call is unexpected —
  // fail loudly during development rather than silently no-op.
  // eslint-disable-next-line no-console
  console.warn('[db.web] Unhandled execSync statement:', stmt);
}

function execSync(sql: string) {
  sql.split(';').forEach(runStatement);
}

function selectRows(sql: string, params: any[] = []): Row[] {
  // Schema introspection queries used by the native migration path — nothing to report here.
  if (/pragma_table_info|sqlite_master/i.test(sql)) return [];

  const m = sql.match(
    /^SELECT\s+(?:\*|[\w,\s]+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?(?:\s+ORDER BY\s+(\w+)\s+(ASC|DESC))?\s*;?$/i
  );
  if (!m) {
    console.warn('[db.web] Unhandled SELECT:', sql);
    return [];
  }
  const [, table, whereCol, orderCol, orderDir] = m;
  let rows = Array.from(ensureTable(table).values());
  if (whereCol) {
    const value = params[0];
    rows = rows.filter((r) => r[whereCol] === value);
  }
  if (orderCol) {
    rows = [...rows].sort((a, b) => {
      const av = String(a[orderCol] ?? '');
      const bv = String(b[orderCol] ?? '');
      return orderDir?.toUpperCase() === 'DESC' ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }
  return rows.map((r) => ({ ...r }));
}

function getAllSync(sql: string, params: any[] = []): Row[] {
  return selectRows(sql, params);
}

function getFirstSync(sql: string, params: any[] = []): Row | null {
  return selectRows(sql, params)[0] ?? null;
}

function runSync(sql: string, params: any[] = []) {
  let m: RegExpMatchArray | null;

  if ((m = sql.match(/^INSERT(?:\s+OR\s+(?:IGNORE|REPLACE))?\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*;?$/i))) {
    const table = ensureTable(m[1]);
    const cols = m[2].split(',').map((c) => c.trim());
    const row: Row = {};
    cols.forEach((c, i) => (row[c] = params[i]));
    table.set(row[keyField(m[1])], row);
    return;
  }

  if ((m = sql.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(\w+)\s*=\s*\?\s*;?$/i))) {
    const table = ensureTable(m[1]);
    const setCols = m[2].split(',').map((clause) => {
      const cm = clause.match(/(\w+)\s*=\s*\?/);
      return cm ? cm[1] : null;
    });
    const whereValue = params[params.length - 1];
    const key = whereValue; // all our UPDATE...WHERE clauses key on the row's primary key
    const existing = table.get(key);
    if (!existing) return;
    setCols.forEach((col, i) => {
      if (col) existing[col] = params[i];
    });
    table.set(key, existing);
    return;
  }

  if ((m = sql.match(/^DELETE FROM\s+(\w+)\s+WHERE\s+\w+\s*=\s*\?\s*;?$/i))) {
    ensureTable(m[1]).delete(params[0]);
    return;
  }

  console.warn('[db.web] Unhandled runSync statement:', sql);
}

export const db = { execSync, runSync, getAllSync, getFirstSync };

export function initDb() {
  ['behaviors', 'events', 'journal_entries', 'reasons', 'checkins', 'milestones', 'kv_settings', 'user_quotes', 'quote_meta'].forEach(ensureTable);
}

export function wipeAllTables() {
  Object.values(tables).forEach((t) => t.clear());
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 3,
    behaviors: Array.from(ensureTable('behaviors').values()),
    events: Array.from(ensureTable('events').values()),
    journalEntries: Array.from(ensureTable('journal_entries').values()),
    reasons: Array.from(ensureTable('reasons').values()),
    checkins: Array.from(ensureTable('checkins').values()),
    milestones: Array.from(ensureTable('milestones').values()),
    userQuotes: Array.from(ensureTable('user_quotes').values()),
    quoteMeta: Array.from(ensureTable('quote_meta').values()),
  };
}
