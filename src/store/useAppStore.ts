import { create } from 'zustand';
import { initDb, wipeAllTables } from '@/data/db';
import { behaviorsRepo, BehaviorInput } from '@/data/repositories/behaviorsRepo';
import { eventsRepo } from '@/data/repositories/eventsRepo';
import { journalRepo } from '@/data/repositories/journalRepo';
import { reasonsRepo } from '@/data/repositories/reasonsRepo';
import { checkinsRepo } from '@/data/repositories/checkinsRepo';
import { milestonesRepo } from '@/data/repositories/milestonesRepo';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import { quotesRepo } from '@/data/repositories/quotesRepo';
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
  UserQuote,
  QuoteMeta,
} from '@/data/types';
import { NotificationPrefs, normalizePrefs } from '@/notifications/prefs';
import { PlannedNotification } from '@/notifications/planner';
import { allQuotes, pickQuote, markShown as markQuoteShownMeta } from '@/notifications/quoteEngine';
import { Quote } from '@/content/quotes';
import type { PermissionState } from '@/notifications/native';
import { generateId } from '@/utils/id';
import { todayKey } from '@/utils/date';
import { cleanDuration, MILESTONE_LADDER } from '@/utils/journey';
import { questionForDate } from '@/content/library';

const CHIP_USAGE_KEY = 'chipUsage';
const NOTIFICATION_PREFS_KEY = 'notificationPrefs';
const NOTIFICATION_PLAN_KEY = 'notificationPlan';
const LAST_INSIGHT_KEY = 'lastInsightNotifiedAt';
const QUOTE_OF_DAY_KEY = 'quoteOfDay';

interface StoredPlan {
  key: string;
  kind: PlannedNotification['kind'];
  at: string;
  title: string;
  body: string;
  route: PlannedNotification['route'];
  quoteId?: string;
  behaviorId?: string;
}

function hydratePlan(raw: StoredPlan[]): PlannedNotification[] {
  return raw.map((p) => ({ ...p, at: new Date(p.at) }));
}

function dehydratePlan(plan: PlannedNotification[]): StoredPlan[] {
  return plan.map((p) => ({ ...p, at: p.at.toISOString() }));
}

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

  // Part 3 — quotes & notifications
  userQuotes: UserQuote[];
  quoteMeta: QuoteMeta[];
  notificationPrefs: NotificationPrefs;
  notificationPermission: PermissionState;
  notificationPlan: PlannedNotification[];
  lastInsightNotifiedAt: string | null;
  quoteOfDay: { date: string; id: string } | null;

  boot: () => void;

  addBehavior: (input: BehaviorInput) => Behavior;
  updateBehavior: (id: string, patch: Partial<Behavior>) => void;
  archiveBehavior: (id: string) => void;
  unarchiveBehavior: (id: string) => void;

  logEvent: (input: LogEventInput) => UrgeEvent;
  closeEvent: (id: string, outcome: EventOutcome, extra?: CloseEventExtra) => void;
  updateEvent: (id: string, patch: Partial<UrgeEvent>) => void;
  removeEvent: (id: string) => void;
  restoreEvent: (event: UrgeEvent) => void;

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

  addUserQuote: (category: UserQuote['category'], text: string, author?: string | null) => UserQuote;
  removeUserQuote: (id: string) => void;
  toggleFavoriteQuote: (id: string) => void;
  hideQuote: (id: string) => void;
  unhideQuote: (id: string) => void;
  markQuoteShown: (id: string) => void;
  /** The quote pinned to today's Today card — chosen once per local day. */
  quoteOfTheDay: () => Quote | null;
  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  setNotificationPermission: (p: PermissionState) => void;
  setNotificationPlan: (plan: PlannedNotification[], insightNotifiedAt?: string | null) => void;

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
  userQuotes: [],
  quoteMeta: [],
  notificationPrefs: normalizePrefs(null),
  notificationPermission: 'undetermined',
  notificationPlan: [],
  lastInsightNotifiedAt: null,
  quoteOfDay: null,

  boot: () => {
    initDb();
    set({
      userQuotes: quotesRepo.listUser(),
      quoteMeta: quotesRepo.listMeta(),
      notificationPrefs: normalizePrefs(settingsRepo.getJson<Partial<NotificationPrefs> | null>(NOTIFICATION_PREFS_KEY, null)),
      notificationPlan: hydratePlan(settingsRepo.getJson<StoredPlan[]>(NOTIFICATION_PLAN_KEY, [])),
      lastInsightNotifiedAt: settingsRepo.getJson<string | null>(LAST_INSIGHT_KEY, null),
      quoteOfDay: settingsRepo.getJson<{ date: string; id: string } | null>(QUOTE_OF_DAY_KEY, null),
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

  restoreEvent: (event) => {
    eventsRepo.restore(event);
    set((s) => {
      const events = [event, ...s.events].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
      return { events, behaviors: recomputeCleanSince(event.behaviorId, events, s.behaviors) };
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

  addUserQuote: (category, text, author = null) => {
    const q = quotesRepo.createUser({ category, text: text.trim(), author: author?.trim() || null });
    set((s) => ({ userQuotes: [q, ...s.userQuotes] }));
    return q;
  },

  removeUserQuote: (id) => {
    quotesRepo.removeUser(id);
    set((s) => ({ userQuotes: s.userQuotes.filter((q) => q.id !== id), quoteMeta: s.quoteMeta.filter((m) => m.quoteId !== id) }));
  },

  toggleFavoriteQuote: (id) => {
    set((s) => {
      const existing = s.quoteMeta.find((m) => m.quoteId === id);
      const next: QuoteMeta = existing
        ? { ...existing, isFavorite: !existing.isFavorite }
        : { quoteId: id, isFavorite: true, lastShownAt: null, shownCount: 0, hiddenAt: null };
      quotesRepo.upsertMeta(next);
      return { quoteMeta: [...s.quoteMeta.filter((m) => m.quoteId !== id), next] };
    });
  },

  hideQuote: (id) => {
    set((s) => {
      const existing = s.quoteMeta.find((m) => m.quoteId === id);
      const next: QuoteMeta = {
        quoteId: id,
        isFavorite: existing?.isFavorite ?? false,
        lastShownAt: existing?.lastShownAt ?? null,
        shownCount: existing?.shownCount ?? 0,
        hiddenAt: new Date().toISOString(),
      };
      quotesRepo.upsertMeta(next);
      return { quoteMeta: [...s.quoteMeta.filter((m) => m.quoteId !== id), next] };
    });
  },

  unhideQuote: (id) => {
    set((s) => {
      const existing = s.quoteMeta.find((m) => m.quoteId === id);
      if (!existing) return s;
      const next: QuoteMeta = { ...existing, hiddenAt: null };
      quotesRepo.upsertMeta(next);
      return { quoteMeta: [...s.quoteMeta.filter((m) => m.quoteId !== id), next] };
    });
  },

  markQuoteShown: (id) => {
    set((s) => {
      const next = markQuoteShownMeta(s.quoteMeta, id, new Date());
      quotesRepo.upsertMeta(next);
      return { quoteMeta: [...s.quoteMeta.filter((m) => m.quoteId !== id), next] };
    });
  },

  quoteOfTheDay: () => {
    const s = get();
    const today = todayKey();
    const quotes = allQuotes(s.userQuotes, s.reasons);
    if (s.quoteOfDay?.date === today) {
      const q = quotes.find((x) => x.id === s.quoteOfDay!.id);
      if (q) return q;
    }
    // Exclude anything already planned for a notification this week so the card and the push differ.
    const exclude = new Set(s.notificationPlan.map((p) => p.quoteId).filter(Boolean) as string[]);
    // The Today card already shows the user's own reason underneath — keep the quote itself editorial.
    const prefs = { ...s.notificationPrefs, categories: { ...s.notificationPrefs.categories, own: false } };
    const picked = pickQuote(quotes, { prefs, meta: s.quoteMeta, behaviors: s.behaviors, now: new Date(), exclude });
    if (!picked) return null;
    const entry = { date: today, id: picked.id };
    settingsRepo.setJson(QUOTE_OF_DAY_KEY, entry);
    set({ quoteOfDay: entry });
    get().markQuoteShown(picked.id);
    return picked;
  },

  updateNotificationPrefs: (patch) => {
    set((s) => {
      const notificationPrefs = normalizePrefs({
        ...s.notificationPrefs,
        ...patch,
        kinds: { ...s.notificationPrefs.kinds, ...(patch.kinds ?? {}) },
        categories: { ...s.notificationPrefs.categories, ...(patch.categories ?? {}) },
      });
      settingsRepo.setJson(NOTIFICATION_PREFS_KEY, notificationPrefs);
      // Keep the legacy boolean in sync for export / older screens.
      if (notificationPrefs.enabled !== s.settings.notificationsEnabled) settingsRepo.set('notificationsEnabled', notificationPrefs.enabled);
      return { notificationPrefs, settings: { ...s.settings, notificationsEnabled: notificationPrefs.enabled } };
    });
  },

  setNotificationPermission: (p) => set({ notificationPermission: p }),

  setNotificationPlan: (plan, insightNotifiedAt) => {
    settingsRepo.setJson(NOTIFICATION_PLAN_KEY, dehydratePlan(plan));
    const patch: Partial<AppState> = { notificationPlan: plan };
    if (insightNotifiedAt !== undefined) {
      settingsRepo.setJson(LAST_INSIGHT_KEY, insightNotifiedAt);
      patch.lastInsightNotifiedAt = insightNotifiedAt;
    }
    set(patch);
  },

  updateSetting: (key, value) => {
    settingsRepo.set(key, value);
    set((s) => ({ settings: { ...s.settings, [key]: value } }));
    if (key === 'notificationsEnabled') get().updateNotificationPrefs({ enabled: !!value });
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
      userQuotes: [],
      quoteMeta: [],
      notificationPrefs: normalizePrefs(null),
      notificationPlan: [],
      lastInsightNotifiedAt: null,
      quoteOfDay: null,
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
