import assert from 'node:assert/strict';
import test from 'node:test';
import { BUILTIN_QUOTES, EDITORIAL_QUOTES, STORIES } from '../src/content/quotes';
import { firstDayState } from '../src/utils/firstDay';
import { MAX_ACTIVE_BEHAVIORS, canActivateBehavior } from '../src/utils/behaviorLimits';
import { DEFAULT_NOTIFICATION_PREFS } from '../src/notifications/prefs';
import { planNotifications } from '../src/notifications/planner';
import type { Behavior } from '../src/data/types';

test('içerik havuzu 56 kısa içerik ve 4 hikâyeden oluşur', () => {
  assert.equal(EDITORIAL_QUOTES.length, 56);
  assert.equal(STORIES.length, 4);
  assert.equal(BUILTIN_QUOTES.length, 60);
  assert.ok(STORIES.every((item) => item.notificationEligible === false));
});

test('ilk 24 saat sayacı sınırları doğru hesaplar', () => {
  assert.deepEqual(firstDayState(0), { progress: 0, value: 0, unit: 'dk', remaining: '24 sa kaldı', complete: false });
  assert.equal(firstDayState(1).remaining, '23 sa 59 dk kaldı');
  assert.equal(firstDayState(1439).remaining, '1 dk kaldı');
  assert.equal(firstDayState(1440).complete, true);
});

test('beş aktif davranıştan sonra yeni alan engellenir', () => {
  const makeBehavior = (index: number, archived = false) => ({ id: String(index), archived } as Behavior);
  assert.equal(canActivateBehavior(Array.from({ length: MAX_ACTIVE_BEHAVIORS - 1 }, (_, index) => makeBehavior(index))), true);
  assert.equal(canActivateBehavior(Array.from({ length: MAX_ACTIVE_BEHAVIORS }, (_, index) => makeBehavior(index))), false);
  assert.equal(canActivateBehavior([...Array.from({ length: 5 }, (_, index) => makeBehavior(index, index === 4))]), true);
});

test('saatlik söz planı destek bütçesinden bağımsızdır ve havuz bitmeden tekrarlamaz', () => {
  const now = new Date(2026, 8, 21, 8, 0, 0, 0);
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, enabled: true, scheduleMode: 'interval' as const, intervalMinutes: 60 as const, activeFrom: '09:00', activeTo: '23:00', quietFrom: '00:00', quietTo: '07:30' };
  const plan = planNotifications({ prefs, behaviors: [], events: [], quotes: EDITORIAL_QUOTES, meta: [], insights: [], now, previous: [], lastInsightNotifiedAt: null });
  const quotePlan = plan.filter((item) => item.kind === 'quote');
  assert.equal(quotePlan.length, 105);
  assert.equal(new Set(quotePlan.slice(0, 56).map((item) => item.quoteId)).size, 56);
  assert.ok(quotePlan.every((item) => item.at.getMinutes() === 0));
});
