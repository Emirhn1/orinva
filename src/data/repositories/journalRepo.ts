import { db } from '@/data/db';
import { JournalEntry } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToEntry(row: any): JournalEntry {
  return {
    id: row.id,
    createdAt: row.createdAt,
    text: row.text,
    linkedEventId: row.linkedEventId,
    tag: row.tag ?? null,
    mood: row.mood ?? null,
  };
}

export const journalRepo = {
  list(): JournalEntry[] {
    const rows = db.getAllSync('SELECT * FROM journal_entries ORDER BY createdAt DESC;');
    return rows.map(rowToEntry);
  },

  get(id: string): JournalEntry | null {
    const row = db.getFirstSync('SELECT * FROM journal_entries WHERE id = ?;', [id]);
    return row ? rowToEntry(row) : null;
  },

  create(input: Omit<JournalEntry, 'id' | 'createdAt'>): JournalEntry {
    const entry: JournalEntry = { ...input, id: generateId(), createdAt: new Date().toISOString() };
    db.runSync(
      `INSERT INTO journal_entries (id, createdAt, text, linkedEventId, tag, mood) VALUES (?, ?, ?, ?, ?, ?);`,
      [entry.id, entry.createdAt, entry.text, entry.linkedEventId, entry.tag, entry.mood]
    );
    return entry;
  },

  update(id: string, patch: Partial<JournalEntry>): void {
    const existing = journalRepo.get(id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    db.runSync(`UPDATE journal_entries SET text=?, tag=?, mood=? WHERE id=?;`, [next.text, next.tag, next.mood, id]);
  },

  remove(id: string): void {
    db.runSync('DELETE FROM journal_entries WHERE id = ?;', [id]);
  },
};
