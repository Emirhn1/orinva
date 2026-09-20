import { create } from 'zustand';
import { BehaviorCategory, GoalMode } from '@/data/types';

interface OnboardingDraft {
  category: BehaviorCategory | null;
  nickname: string;
  goalMode: GoalMode | null;
  whyChips: string[];
  whyText: string;
  planChip: string | null;
  set: (patch: Partial<Omit<OnboardingDraft, 'set' | 'reset'>>) => void;
  reset: () => void;
}

const EMPTY = { category: null, nickname: '', goalMode: null, whyChips: [], whyText: '', planChip: null };

export const useOnboardingStore = create<OnboardingDraft>((set) => ({
  ...EMPTY,
  set: (patch) => set(patch),
  reset: () => set({ ...EMPTY }),
}));
