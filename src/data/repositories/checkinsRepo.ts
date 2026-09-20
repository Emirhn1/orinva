import { db } from '@/data/db';
import { CheckIn } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToCheckIn(row: any): CheckIn {
  return {
    id: row.id,
    date: row.date,
    question: row.question,
    answer: row.answer,
    skipped: !!row.skipped,
  };
}

export const checkinsRepo = {
  list(): CheckIn[] {
    const rows = db.getAllSync('SELECT * FROM checkins ORDER BY date DESC;');
    return rows.map(rowToCheckIn);
  },

  getForDate(date: string): CheckIn | null {
    const row = db.getFirstSync('SELECT * FROM checkins WHERE date = ?;', [date]);
    return row ? rowToCheckIn(row) : null;
  },

  upsert(date: string, question: string, patch: { answer?: string | null; skipped?: boolean }): CheckIn {
    const existing = checkinsRepo.getForDate(date);
    if (existing) {
      const next = { ...existing, ...patch };
      db.runSync('UPDATE checkins SET answer = ?, skipped = ? WHERE id = ?;', [
        next.answer,
        next.skipped ? 1 : 0,
        next.id,
      ]);
      return next;
    }
    const checkIn: CheckIn = {
      id: generateId(),
      date,
      question,
      answer: patch.answer ?? null,
      skipped: patch.skipped ?? false,
    };
    db.runSync('INSERT INTO checkins (id, date, question, answer, skipped) VALUES (?, ?, ?, ?, ?);', [
      checkIn.id,
      checkIn.date,
      checkIn.question,
      checkIn.answer,
      checkIn.skipped ? 1 : 0,
    ]);
    return checkIn;
  },
};
