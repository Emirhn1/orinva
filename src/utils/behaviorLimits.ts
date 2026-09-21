import { Behavior } from '@/data/types';

export const MAX_ACTIVE_BEHAVIORS = 5;

export function activeBehaviorCount(behaviors: Behavior[]): number {
  return behaviors.filter((behavior) => !behavior.archived).length;
}

export function canActivateBehavior(behaviors: Behavior[]): boolean {
  return activeBehaviorCount(behaviors) < MAX_ACTIVE_BEHAVIORS;
}
