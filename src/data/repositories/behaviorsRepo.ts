import { db } from '@/data/db';
import { Behavior } from '@/data/types';
import { generateId } from '@/utils/id';
import { behaviorAppearanceFor, behaviorVerbsFor } from '@/content/behaviors';

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function rowToBehavior(row: any): Behavior {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    verbUrge: row.verb_urge,
    verbResist: row.verb_resist,
    verbDid: row.verb_did,
    needsNameReview: !!row.needs_name_review,
    color: row.color ?? behaviorAppearanceFor(row.category).color,
    icon: row.icon ?? behaviorAppearanceFor(row.category).icon,
    goalMode: row.goalMode,
    unit: row.unit,
    costPerUnit: num(row.costPerUnit),
    costCurrency: row.costCurrency ?? undefined,
    minutesPerUnit: num(row.minutesPerUnit),
    baselinePerDay: num(row.baselinePerDay),
    savingsGoalLabel: row.savingsGoalLabel ?? undefined,
    savingsGoalAmount: num(row.savingsGoalAmount),
    dailyTarget: num(row.dailyTarget),
    planAlternative: row.planAlternative ?? undefined,
    createdAt: row.createdAt,
    archived: !!row.archived,
    cleanSinceAt: row.cleanSinceAt,
  };
}

export type BehaviorInput = Omit<Behavior, 'id' | 'createdAt' | 'archived' | 'cleanSinceAt' | 'verbUrge' | 'verbResist' | 'verbDid' | 'needsNameReview'> &
  Partial<Pick<Behavior, 'verbUrge' | 'verbResist' | 'verbDid'>>;

export const behaviorsRepo = {
  list(): Behavior[] {
    const rows = db.getAllSync('SELECT * FROM behaviors ORDER BY createdAt ASC;');
    return rows.map(rowToBehavior);
  },

  get(id: string): Behavior | null {
    const row = db.getFirstSync('SELECT * FROM behaviors WHERE id = ?;', [id]);
    return row ? rowToBehavior(row) : null;
  },

  create(input: BehaviorInput): Behavior {
    const now = new Date().toISOString();
    const defaults = behaviorVerbsFor(input.category);
    const appearance = behaviorAppearanceFor(input.category);
    const behavior: Behavior = {
      ...input,
      verbUrge: input.verbUrge?.trim() || defaults.urge,
      verbResist: input.verbResist?.trim() || defaults.resist,
      verbDid: input.verbDid?.trim() || defaults.did,
      needsNameReview: false,
      color: input.color ?? appearance.color,
      icon: input.icon ?? appearance.icon,
      id: generateId(),
      createdAt: now,
      archived: false,
      cleanSinceAt: now,
    };
    db.runSync(
      `INSERT INTO behaviors (id, name, category, verb_urge, verb_resist, verb_did, needs_name_review, color, icon, goalMode, unit, costPerUnit, costCurrency, minutesPerUnit, baselinePerDay, savingsGoalLabel, savingsGoalAmount, dailyTarget, planAlternative, createdAt, archived, cleanSinceAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        behavior.id,
        behavior.name,
        behavior.category,
        behavior.verbUrge,
        behavior.verbResist,
        behavior.verbDid,
        0,
        behavior.color,
        behavior.icon,
        behavior.goalMode,
        behavior.unit,
        behavior.costPerUnit ?? null,
        behavior.costCurrency ?? null,
        behavior.minutesPerUnit ?? null,
        behavior.baselinePerDay ?? null,
        behavior.savingsGoalLabel ?? null,
        behavior.savingsGoalAmount ?? null,
        behavior.dailyTarget ?? null,
        behavior.planAlternative ?? null,
        behavior.createdAt,
        0,
        behavior.cleanSinceAt,
      ]
    );
    return behavior;
  },

  update(id: string, patch: Partial<Behavior>): Behavior | null {
    const existing = behaviorsRepo.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE behaviors SET name=?, category=?, verb_urge=?, verb_resist=?, verb_did=?, needs_name_review=?, color=?, icon=?, goalMode=?, unit=?, costPerUnit=?, costCurrency=?, minutesPerUnit=?, baselinePerDay=?, savingsGoalLabel=?, savingsGoalAmount=?, dailyTarget=?, planAlternative=?, archived=?, cleanSinceAt=? WHERE id=?;`,
      [
        next.name,
        next.category,
        next.verbUrge,
        next.verbResist,
        next.verbDid,
        next.needsNameReview ? 1 : 0,
        next.color,
        next.icon,
        next.goalMode,
        next.unit,
        next.costPerUnit ?? null,
        next.costCurrency ?? null,
        next.minutesPerUnit ?? null,
        next.baselinePerDay ?? null,
        next.savingsGoalLabel ?? null,
        next.savingsGoalAmount ?? null,
        next.dailyTarget ?? null,
        next.planAlternative ?? null,
        next.archived ? 1 : 0,
        next.cleanSinceAt,
        id,
      ]
    );
    return next;
  },

  setCleanSince(id: string, at: string): void {
    db.runSync('UPDATE behaviors SET cleanSinceAt = ? WHERE id = ?;', [at, id]);
  },

  archive(id: string): void {
    db.runSync('UPDATE behaviors SET archived = 1 WHERE id = ?;', [id]);
  },

  unarchive(id: string): void {
    db.runSync('UPDATE behaviors SET archived = 0 WHERE id = ?;', [id]);
  },
};
