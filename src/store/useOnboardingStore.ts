import { create } from 'zustand';
import { BehaviorCategory, GoalMode } from '@/data/types';

interface OnboardingDraft {
  category: BehaviorCategory | null;
  customName: string;
  goalMode: GoalMode | null;
  reasonText: string;
  planAlternative: string;
  set: (patch: Partial<Omit<OnboardingDraft, 'set' | 'reset'>>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingDraft>((set) => ({
  category: null,
  customName: '',
  goalMode: null,
  reasonText: '',
  planAlternative: '',
  set: (patch) => set(patch),
  reset: () => set({ category: null, customName: '', goalMode: null, reasonText: '', planAlternative: '' }),
}));
