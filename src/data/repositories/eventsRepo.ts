import { db } from '@/data/db';
import { UrgeEvent } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToEvent(row: any): UrgeEvent {
  return {
    id: row.id,
    behaviorId: row.behaviorId,
    kind: row.kind,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    intensity: row.intensity,
    mood: row.mood,
    contextTags: JSON.parse(row.contextTags ?? '[]'),
    note: row.note,
    outcome: row.outcome,
    helpedByPlan: row.helpedByPlan,
  };
}

export const eventsRepo = {
  list(): UrgeEvent[] {
    const rows = db.getAllSync('SELECT * FROM events ORDER BY startedAt DESC;');
    return rows.map(rowToEvent);
  },

  listForBehavior(behaviorId: string): UrgeEvent[] {
    const rows = db.getAllSync('SELECT * FROM events WHERE behaviorId = ? ORDER BY startedAt DESC;', [behaviorId]);
    return rows.map(rowToEvent);
  },

  get(id: string): UrgeEvent | null {
    const row = db.getFirstSync('SELECT * FROM events WHERE id = ?;', [id]);
    return row ? rowToEvent(row) : null;
  },

  create(input: Omit<UrgeEvent, 'id'>): UrgeEvent {
    const event: UrgeEvent = { ...input, id: generateId() };
    db.runSync(
      `INSERT INTO events (id, behaviorId, kind, startedAt, endedAt, intensity, mood, contextTags, note, outcome, helpedByPlan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.behaviorId,
        event.kind,
        event.startedAt,
        event.endedAt,
        event.intensity,
        event.mood,
        JSON.stringify(event.contextTags ?? []),
        event.note,
        event.outcome,
        event.helpedByPlan,
      ]
    );
    return event;
  },

  update(id: string, patch: Partial<UrgeEvent>): void {
    const existing = eventsRepo.get(id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE events SET kind=?, endedAt=?, intensity=?, mood=?, contextTags=?, note=?, outcome=?, helpedByPlan=? WHERE id=?;`,
      [
        next.kind,
        next.endedAt,
        next.intensity,
        next.mood,
        JSON.stringify(next.contextTags ?? []),
        next.note,
        next.outcome,
        next.helpedByPlan,
        id,
      ]
    );
  },
};
