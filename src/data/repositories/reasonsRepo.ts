import { db } from '@/data/db';
import { Reason } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToReason(row: any): Reason {
  return {
    id: row.id,
    behaviorId: row.behaviorId,
    type: row.type,
    text: row.text,
    createdAt: row.createdAt,
  };
}

export const reasonsRepo = {
  list(): Reason[] {
    const rows = db.getAllSync('SELECT * FROM reasons ORDER BY createdAt DESC;');
    return rows.map(rowToReason);
  },

  create(input: Omit<Reason, 'id' | 'createdAt'>): Reason {
    const reason: Reason = { ...input, id: generateId(), createdAt: new Date().toISOString() };
    db.runSync(`INSERT INTO reasons (id, behaviorId, type, text, createdAt) VALUES (?, ?, ?, ?, ?);`, [
      reason.id,
      reason.behaviorId,
      reason.type,
      reason.text,
      reason.createdAt,
    ]);
    return reason;
  },

  remove(id: string): void {
    db.runSync('DELETE FROM reasons WHERE id = ?;', [id]);
  },
};
