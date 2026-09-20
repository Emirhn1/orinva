export type BehaviorCategory = 'nicotine' | 'social_media' | 'custom';

export type GoalMode = 'quit' | 'reduce' | 'delay' | 'notice';

export type BehaviorUnit = 'event' | 'minutes' | 'count' | 'yesno';

export interface Behavior {
  id: string;
  name: string;
  category: BehaviorCategory;
  goalMode: GoalMode;
  unit: BehaviorUnit;
  costPerUnit?: number;
  costCurrency?: string;
  planAlternative?: string;
  createdAt: string; // ISO
  archived: boolean;
  cleanSinceAt: string; // ISO — reset whenever an "acted" outcome is logged
}

export type EventKind = 'urge' | 'acted' | 'resisted';
export type EventOutcome = 'passed' | 'delayed' | 'acted' | 'unsure' | null;

export interface UrgeEvent {
  id: string;
  behaviorId: string;
  kind: EventKind;
  startedAt: string; // ISO
  endedAt: string | null;
  intensity: number | null; // 1-5
  mood: string | null;
  contextTags: string[];
  note: string | null;
  outcome: EventOutcome;
  helpedByPlan: string | null; // which micro-intervention helped, free label
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  text: string;
  linkedEventId: string | null;
  tag: string | null;
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
}

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'system',
  notificationsEnabled: false,
  appLockEnabled: false,
  streakRingEnabled: true,
  onboardingCompleted: false,
};
