import { create } from 'zustand';
import { initDb, wipeAllTables } from '@/data/db';
import { behaviorsRepo, BehaviorInput } from '@/data/repositories/behaviorsRepo';
import { eventsRepo } from '@/data/repositories/eventsRepo';
import { journalRepo } from '@/data/repositories/journalRepo';
import { reasonsRepo } from '@/data/repositories/reasonsRepo';
import { checkinsRepo } from '@/data/repositories/checkinsRepo';
import { milestonesRepo } from '@/data/repositories/milestonesRepo';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import {
  Behavior,
  UrgeEvent,
  JournalEntry,
  Reason,
  CheckIn,
  Milestone,
  AppSettings,
  DEFAULT_SETTINGS,
  EventOutcome,
  EventSource,
  ChipUsage,
} from '@/data/types';
import { generateId } from '@/utils/id';
import { todayKey } from '@/utils/date';
import { cleanDuration, MILESTONE_LADDER } from '@/utils/journey';
import { questionForDate } from '@/content/library';

const CHIP_USAGE_KEY = 'chipUsage';

export interface LogEventInput {
  behaviorId: string;
  intensity?: number | null;
  mood?: string | null;
  triggers?: string[];
  location?: string | null;
  company?: string | null;
  note?: string | null;
  outcome?: EventOutcome;
  helpedByPlan?: string | null;
  delaySeconds?: number | null;
  source?: EventSource;
}

export interface CloseEventExtra {
  helpedByPlan?: string | null;
  delaySeconds?: number | null;
  intensityAfter?: number | null;
}

interface AppState {
  ready: boolean;
  behaviors: Behavior[];
  events: UrgeEvent[];
  journalEntries: JournalEntry[];
  reasons: Reason[];
  checkins: CheckIn[];
  milestones: Milestone[];
  settings: AppSettings;
  chipUsage: ChipUsage;
  pendingMilestone: Milestone | null;

  boot: () => void;

  addBehavior: (input: BehaviorInput) => Behavior;
  updateBehavior: (id: string, patch: Partial<Behavior>) => void;
  archiveBehavior: (id: string) => void;
  unarchiveBehavior: (id: string) => void;

  logEvent: (input: LogEventInput) => UrgeEvent;
  closeEvent: (id: string, outcome: EventOutcome, extra?: CloseEventExtra) => void;
  updateEvent: (id: string, patch: Partial<UrgeEvent>) => void;
  removeEvent: (id: string) => void;

  addJournalEntry: (input: { text: string; linkedEventId?: string | null; tag?: string | null; mood?: string | null }) => JournalEntry;
  updateJournalEntry: (id: string, patch: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;

  addReason: (behaviorId: string | null, type: Reason['type'], text: string) => Reason;
  removeReason: (id: string) => void;

  submitCheckIn: (answer: string | null, skipped: boolean) => CheckIn;
  todaysCheckIn: () => CheckIn | null;

  acknowledgeMilestone: (id: string) => void;
  dismissPendingMilestone: () => void;

  bumpChipUsage: (keys: string[]) => void;

  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  completeOnboarding: () => void;
  wipeAllData: () => void;
}

/**
 * Clean time is derived, never trusted blindly: it's the later of the
 * behavior's creation and its most recent "acted" event. Undoing or editing
 * an event therefore never leaves a stale timer behind.
 */
function recomputeCleanSince(behaviorId: string, events: UrgeEvent[], behaviors: Behavior[]): Behavior[] {
  const behavior = behaviors.find((b) => b.id === behaviorId);
  if (!behavior) return behaviors;
  const lastActed = events
    .filter((e) => e.behaviorId === behaviorId && e.outcome === 'acted')
    .map((e) => e.startedAt)
    .sort()
    .pop();
  const next = lastActed && lastActed > behavior.createdAt ? lastActed : behavior.createdAt;
  if (next === behavior.cleanSinceAt) return behaviors;
  behaviorsRepo.setCleanSince(behaviorId, next);
  return behaviors.map((b) => (b.id === behaviorId ? { ...b, cleanSinceAt: next } : b));
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  behaviors: [],
  events: [],
  journalEntries: [],
  reasons: [],
  checkins: [],
  milestones: [],
  settings: DEFAULT_SETTINGS,
  chipUsage: {},
  pendingMilestone: null,

  boot: () => {
    initDb();
    set({
      behaviors: behaviorsRepo.list(),
      events: eventsRepo.list(),
      journalEntries: journalRepo.list(),
      reasons: reasonsRepo.list(),
      checkins: checkinsRepo.list(),
      milestones: milestonesRepo.list(),
      settings: settingsRepo.load(),
      chipUsage: settingsRepo.getJson<ChipUsage>(CHIP_USAGE_KEY, {}),
      ready: true,
    });
  },

  addBehavior: (input) => {
    const behavior = behaviorsRepo.create(input);
    set((s) => ({ behaviors: [...s.behaviors, behavior] }));
    return behavior;
  },

  updateBehavior: (id, patch) => {
    const next = behaviorsRepo.update(id, patch);
    if (!next) return;
    set((s) => ({ behaviors: s.behaviors.map((b) => (b.id === id ? next : b)) }));
  },

  archiveBehavior: (id) => {
    behaviorsRepo.archive(id);
    set((s) => ({ behaviors: s.behaviors.map((b) => (b.id === id ? { ...b, archived: true } : b)) }));
  },

  unarchiveBehavior: (id) => {
    behaviorsRepo.unarchive(id);
    set((s) => ({ behaviors: s.behaviors.map((b) => (b.id === id ? { ...b, archived: false } : b)) }));
  },

  logEvent: (input) => {
    const now = new Date().toISOString();
    const outcome = input.outcome ?? null;
    const event = eventsRepo.create({
      behaviorId: input.behaviorId,
      startedAt: now,
      endedAt: outcome ? now : null,
      intensity: input.intensity ?? null,
      intensityAfter: null,
      mood: input.mood ?? null,
      triggers: input.triggers ?? [],
      location: input.location ?? null,
      company: input.company ?? null,
      note: input.note ?? null,
      outcome,
      outcomeUpdatedAt: outcome ? now : null,
      delaySeconds: input.delaySeconds ?? null,
      helpedByPlan: input.helpedByPlan ?? null,
      source: input.source ?? 'app',
    });
    set((s) => {
      const events = [event, ...s.events];
      const behaviors = outcome === 'acted' ? recomputeCleanSince(input.behaviorId, events, s.behaviors) : s.behaviors;
      return { events, behaviors };
    });
    return event;
  },

  closeEvent: (id, outcome, extra) => {
    const now = new Date().toISOString();
    const patch: Partial<UrgeEvent> = {
      outcome,
      outcomeUpdatedAt: now,
      endedAt: now,
    };
    if (extra?.helpedByPlan !== undefined) patch.helpedByPlan = extra.helpedByPlan;
    if (extra?.delaySeconds !== undefined) patch.delaySeconds = extra.delaySeconds;
    if (extra?.intensityAfter !== undefined) patch.intensityAfter = extra.intensityAfter;
    get().updateEvent(id, patch);
  },

  updateEvent: (id, patch) => {
    const next = eventsRepo.update(id, patch);
    if (!next) return;
    set((s) => {
      const events = s.events.map((e) => (e.id === id ? next : e));
      const behaviors = recomputeCleanSince(next.behaviorId, events, s.behaviors);
      return { events, behaviors };
    });
  },

  removeEvent: (id) => {
    const existing = get().events.find((e) => e.id === id);
    if (!existing) return;
    eventsRepo.remove(id);
    set((s) => {
      const events = s.events.filter((e) => e.id !== id);
      const behaviors = recomputeCleanSince(existing.behaviorId, events, s.behaviors);
      return { events, behaviors };
    });
  },

  addJournalEntry: ({ text, linkedEventId = null, tag = null, mood = null }) => {
    const entry = journalRepo.create({ text, linkedEventId, tag, mood });
    set((s) => ({ journalEntries: [entry, ...s.journalEntries] }));
    return entry;
  },

  updateJournalEntry: (id, patch) => {
    journalRepo.update(id, patch);
    set((s) => ({ journalEntries: s.journalEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  },

  removeJournalEntry: (id) => {
    journalRepo.remove(id);
    set((s) => ({ journalEntries: s.journalEntries.filter((e) => e.id !== id) }));
  },

  addReason: (behaviorId, type, text) => {
    const reason = reasonsRepo.create({ behaviorId, type, text });
    set((s) => ({ reasons: [reason, ...s.reasons] }));
    return reason;
  },

  removeReason: (id) => {
    reasonsRepo.remove(id);
    set((s) => ({ reasons: s.reasons.filter((r) => r.id !== id) }));
  },

  submitCheckIn: (answer, skipped) => {
    const date = todayKey();
    const question = questionForDate();
    const checkIn = checkinsRepo.upsert(date, question, { answer, skipped });
    set((s) => ({ checkins: [checkIn, ...s.checkins.filter((c) => c.date !== date)] }));
    return checkIn;
  },

  todaysCheckIn: () => {
    return get().checkins.find((c) => c.date === todayKey()) ?? null;
  },

  acknowledgeMilestone: (id) => {
    milestonesRepo.acknowledge(id);
    set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? { ...m, acknowledged: true } : m)) }));
  },

  dismissPendingMilestone: () => set({ pendingMilestone: null }),

  bumpChipUsage: (keys) => {
    if (!keys.length) return;
    set((s) => {
      const chipUsage = { ...s.chipUsage };
      for (const k of keys) chipUsage[k] = (chipUsage[k] ?? 0) + 1;
      settingsRepo.setJson(CHIP_USAGE_KEY, chipUsage);
      return { chipUsage };
    });
  },

  updateSetting: (key, value) => {
    settingsRepo.set(key, value);
    set((s) => ({ settings: { ...s.settings, [key]: value } }));
  },

  completeOnboarding: () => {
    settingsRepo.set('onboardingCompleted', true);
    set((s) => ({ settings: { ...s.settings, onboardingCompleted: true } }));
  },

  wipeAllData: () => {
    wipeAllTables();
    set({
      behaviors: [],
      events: [],
      journalEntries: [],
      reasons: [],
      checkins: [],
      milestones: [],
      settings: DEFAULT_SETTINGS,
      chipUsage: {},
      pendingMilestone: null,
    });
  },
}));

/** Checks a behavior against the milestone ladder and records newly-reached ones. */
export function checkMilestonesForBehavior(behaviorId: string) {
  const state = useAppStore.getState();
  const behavior = state.behaviors.find((b) => b.id === behaviorId);
  if (!behavior || behavior.archived) return;
  const { totalHours } = cleanDuration(behavior);
  const already = state.milestones
    .filter((m) => m.behaviorId === behaviorId && m.reachedAt >= behavior.cleanSinceAt)
    .map((m) => m.label);
  for (const step of MILESTONE_LADDER) {
    if (totalHours >= step.hours && !already.includes(step.label)) {
      const milestone: Milestone = {
        id: generateId(),
        behaviorId,
        label: step.label,
        thresholdHours: step.hours,
        reachedAt: new Date().toISOString(),
        acknowledged: false,
      };
      milestonesRepo.create(milestone);
      useAppStore.setState((s) => ({ milestones: [milestone, ...s.milestones], pendingMilestone: s.pendingMilestone ?? milestone }));
    }
  }
}

/** Case-insensitive lookup used by H2 (duplicate nickname guard). */
export function findBehaviorByName(name: string, behaviors: Behavior[]): Behavior | undefined {
  const needle = name.trim().toLocaleLowerCase('tr-TR');
  return behaviors.find((b) => !b.archived && b.name.trim().toLocaleLowerCase('tr-TR') === needle);
}
