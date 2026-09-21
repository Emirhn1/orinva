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
    situation: row.situation ?? null,
    thought: row.thought ?? null,
    reframe: row.reframe ?? null,
    isDraft: !!row.isDraft,
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
    const entry: JournalEntry = {
      ...input,
      situation: input.situation ?? null,
      thought: input.thought ?? null,
      reframe: input.reframe ?? null,
      isDraft: input.isDraft ?? false,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    db.runSync(
      `INSERT INTO journal_entries (id, createdAt, text, linkedEventId, tag, mood, situation, thought, reframe, isDraft) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [entry.id, entry.createdAt, entry.text, entry.linkedEventId, entry.tag, entry.mood, entry.situation, entry.thought, entry.reframe, entry.isDraft ? 1 : 0]
    );
    return entry;
  },

  update(id: string, patch: Partial<JournalEntry>): void {
    const existing = journalRepo.get(id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE journal_entries SET text=?, tag=?, mood=?, situation=?, thought=?, reframe=?, isDraft=? WHERE id=?;`,
      [next.text, next.tag, next.mood, next.situation, next.thought, next.reframe, next.isDraft ? 1 : 0, id]
    );
  },

  remove(id: string): void {
    db.runSync('DELETE FROM journal_entries WHERE id = ?;', [id]);
  },
};
