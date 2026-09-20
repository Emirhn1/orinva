export type BehaviorCategory = 'nicotine' | 'social_media' | 'sugar' | 'alcohol' | 'gambling' | 'caffeine' | 'gaming' | 'custom';

export type GoalMode = 'quit' | 'reduce' | 'delay' | 'notice';

export type BehaviorUnit = 'event' | 'minutes' | 'count' | 'yesno';
export type BehaviorColor = 'indigo' | 'navy' | 'success' | 'amber' | 'violet' | 'slateBlue' | 'cyan' | 'bronze';

export interface Behavior {
  id: string;
  /** User-facing nickname — required ("Sabah sigarası", "Instagram akşam"). */
  name: string;
  category: BehaviorCategory;
  verbUrge: string;
  verbResist: string;
  verbDid: string;
  /** True only for nicknames generated while migrating a legacy record. */
  needsNameReview: boolean;
  color: BehaviorColor;
  icon: string;
  goalMode: GoalMode;
  unit: BehaviorUnit;
  /** Kazanç sayacı: cost per unit (₺), minutes per unit and the pre-app baseline per day. */
  costPerUnit?: number;
  costCurrency?: string;
  minutesPerUnit?: number;
  baselinePerDay?: number;
  savingsGoalLabel?: string;
  savingsGoalAmount?: number;
  /** "Azalt" modu: günlük hedef adet (F8). */
  dailyTarget?: number;
  planAlternative?: string;
  createdAt: string; // ISO
  archived: boolean;
  cleanSinceAt: string; // ISO — reset whenever an "acted" outcome is logged
}

/**
 * H5 — the model is "event = urge, outcome = what happened".
 * An event is always an urge; the outcome may be filled in later (null = still open).
 * `resisted` replaces the old `passed` label.
 */
export type EventOutcome = 'resisted' | 'delayed' | 'acted' | 'unsure' | null;

/** Which entry point produced the record — lets us measure what actually gets used. */
export type EventSource = 'app' | 'today' | 'craving_help' | 'wave' | 'delay_timer' | 'onboarding' | 'widget';

export interface UrgeEvent {
  id: string;
  behaviorId: string;
  startedAt: string; // ISO
  endedAt: string | null;
  intensity: number | null; // 1-5, at the moment of the urge
  intensityAfter: number | null; // 1-5, measured after wave mode / delay timer
  mood: string | null;
  triggers: string[];
  location: string | null;
  company: string | null;
  note: string | null;
  outcome: EventOutcome;
  outcomeUpdatedAt: string | null;
  delaySeconds: number | null; // how long the user delayed before deciding
  helpedByPlan: string | null; // which micro-intervention helped, free label
  source: EventSource;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  text: string;
  linkedEventId: string | null;
  tag: string | null;
  mood: string | null;
}

export type ReasonType = 'reason' | 'future_self';

export interface Reason {
  id: string;
  behaviorId: string | null; // null = applies to all behaviors
  type: ReasonType;
  text: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  date: string; // yyyy-mm-dd
  question: string;
  answer: string | null;
  skipped: boolean;
}

export interface Milestone {
  id: string;
  behaviorId: string;
  label: string;
  thresholdHours: number;
  reachedAt: string;
  acknowledged: boolean;
}

export interface AppSettings {
  themePreference: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  appLockEnabled: boolean;
  streakRingEnabled: boolean;
  onboardingCompleted: boolean;
  displayName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'system',
  notificationsEnabled: false,
  appLockEnabled: false,
  streakRingEnabled: true,
  onboardingCompleted: false,
  displayName: '',
};

/** Aggregated chip usage counts, keyed by chip id — drives the "most used first" ordering. */
export type ChipUsage = Record<string, number>;

/** A quote the user added themselves ("Kendi yazdıklarım" / "Kendi şarkı sözlerim"). */
export interface UserQuote {
  id: string;
  category: 'own' | 'lyrics';
  text: string;
  author: string | null;
  createdAt: string;
}

/** Per-quote state for both built-in and user quotes (favorite, shown history, hidden). */
export interface QuoteMeta {
  quoteId: string;
  isFavorite: boolean;
  lastShownAt: string | null;
  shownCount: number;
  hiddenAt: string | null;
}
