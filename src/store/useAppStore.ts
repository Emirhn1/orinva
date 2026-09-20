import { create } from 'zustand';
import { initDb, wipeAllTables } from '@/data/db';
import { behaviorsRepo } from '@/data/repositories/behaviorsRepo';
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
  EventKind,
  EventOutcome,
} from '@/data/types';
import { generateId } from '@/utils/id';
import { todayKey } from '@/utils/date';
import { cleanDuration } from '@/utils/journey';
import { questionForDate } from '@/content/library';

interface AppState {
  ready: boolean;
  behaviors: Behavior[];
  events: UrgeEvent[];
  journalEntries: JournalEntry[];
  reasons: Reason[];
  checkins: CheckIn[];
  milestones: Milestone[];
  settings: AppSettings;
  pendingMilestone: Milestone | null;

  boot: () => void;

  addBehavior: (input: {
    name: string;
    category: Behavior['category'];
    goalMode: Behavior['goalMode'];
    unit: Behavior['unit'];
    costPerUnit?: number;
    costCurrency?: string;
    planAlternative?: string;
  }) => Behavior;
  archiveBehavior: (id: string) => void;

  logEvent: (input: {
    behaviorId: string;
    kind: EventKind;
    intensity?: number | null;
    mood?: string | null;
    contextTags?: string[];
    note?: string | null;
    outcome?: EventOutcome;
    helpedByPlan?: string | null;
  }) => UrgeEvent;
  closeEvent: (id: string, outcome: EventOutcome, helpedByPlan?: string | null) => void;
  logRelapse: (behaviorId: string, note?: string | null) => void;

  addJournalEntry: (text: string, linkedEventId?: string | null, tag?: string | null) => JournalEntry;
  updateJournalEntry: (id: string, patch: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;

  addReason: (behaviorId: string | null, type: Reason['type'], text: string) => Reason;
  removeReason: (id: string) => void;

  submitCheckIn: (answer: string | null, skipped: boolean) => CheckIn;
  todaysCheckIn: () => CheckIn | null;

  acknowledgeMilestone: (id: string) => void;
  dismissPendingMilestone: () => void;

  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  completeOnboarding: () => void;
  wipeAllData: () => void;
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
      ready: true,
    });
  },

  addBehavior: (input) => {
    const behavior = behaviorsRepo.create({ ...input, archived: false } as any);
    set((s) => ({ behaviors: [...s.behaviors, behavior] }));
    return behavior;
  },

  archiveBehavior: (id) => {
    behaviorsRepo.archive(id);
    set((s) => ({ behaviors: s.behaviors.map((b) => (b.id === id ? { ...b, archived: true } : b)) }));
  },

  logEvent: (input) => {
    const event = eventsRepo.create({
      behaviorId: input.behaviorId,
      kind: input.kind,
      startedAt: new Date().toISOString(),
      endedAt: input.outcome ? new Date().toISOString() : null,
      intensity: input.intensity ?? null,
      mood: input.mood ?? null,
      contextTags: input.contextTags ?? [],
      note: input.note ?? null,
      outcome: input.outcome ?? null,
      helpedByPlan: input.helpedByPlan ?? null,
    });
    set((s) => ({ events: [event, ...s.events] }));

    if (input.outcome === 'acted') {
      get().logRelapse(input.behaviorId, input.note ?? null);
    }
    return event;
  },

  closeEvent: (id, outcome, helpedByPlan) => {
    eventsRepo.update(id, { outcome, endedAt: new Date().toISOString(), helpedByPlan: helpedByPlan ?? null });
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, outcome, endedAt: new Date().toISOString(), helpedByPlan: helpedByPlan ?? null } : e)),
    }));
    if (outcome === 'acted') {
      const event = get().events.find((e) => e.id === id);
      if (event) get().logRelapse(event.behaviorId);
    }
  },

  logRelapse: (behaviorId) => {
    behaviorsRepo.resetCleanTimer(behaviorId);
    set((s) => ({
      behaviors: s.behaviors.map((b) =>
        b.id === behaviorId ? { ...b, cleanSinceAt: new Date().toISOString() } : b
      ),
    }));
  },

  addJournalEntry: (text, linkedEventId = null, tag = null) => {
    const entry = journalRepo.create({ text, linkedEventId, tag });
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
      pendingMilestone: null,
    });
  },
}));

/** Checks every active behavior against the milestone ladder and records newly-reached ones. */
export function checkMilestonesForBehavior(behaviorId: string) {
  const state = useAppStore.getState();
  const behavior = state.behaviors.find((b) => b.id === behaviorId);
  if (!behavior) return;
  const { totalHours } = cleanDuration(behavior);
  const already = state.milestones.filter((m) => m.behaviorId === behaviorId).map((m) => m.label);
  const ladder = [
    { label: '24 saat', hours: 24 },
    { label: '3 gün', hours: 72 },
    { label: '7 gün', hours: 24 * 7 },
    { label: '14 gün', hours: 24 * 14 },
    { label: '30 gün', hours: 24 * 30 },
    { label: '90 gün', hours: 24 * 90 },
  ];
  for (const step of ladder) {
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
      useAppStore.setState((s) => ({ milestones: [milestone, ...s.milestones], pendingMilestone: milestone }));
    }
  }
}
