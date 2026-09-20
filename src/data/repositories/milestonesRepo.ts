import { db } from '@/data/db';
import { Milestone } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToMilestone(row: any): Milestone {
  return {
    id: row.id,
    behaviorId: row.behaviorId,
    label: row.label,
    thresholdHours: row.thresholdHours,
    reachedAt: row.reachedAt,
    acknowledged: !!row.acknowledged,
  };
}

export const milestonesRepo = {
  list(): Milestone[] {
    const rows = db.getAllSync('SELECT * FROM milestones ORDER BY reachedAt DESC;');
    return rows.map(rowToMilestone);
  },

  listForBehavior(behaviorId: string): Milestone[] {
    const rows = db.getAllSync('SELECT * FROM milestones WHERE behaviorId = ? ORDER BY reachedAt DESC;', [
      behaviorId,
    ]);
    return rows.map(rowToMilestone);
  },

  create(input: Omit<Milestone, 'id'>): Milestone {
    const milestone: Milestone = { ...input, id: generateId() };
    db.runSync(
      `INSERT INTO milestones (id, behaviorId, label, thresholdHours, reachedAt, acknowledged) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        milestone.id,
        milestone.behaviorId,
        milestone.label,
        milestone.thresholdHours,
        milestone.reachedAt,
        milestone.acknowledged ? 1 : 0,
      ]
    );
    return milestone;
  },

  acknowledge(id: string): void {
    db.runSync('UPDATE milestones SET acknowledged = 1 WHERE id = ?;', [id]);
  },
};
