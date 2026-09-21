import assert from 'node:assert/strict';
import test from 'node:test';
import { computeWidgetSnapshot, computeLockScreenSnapshot, resolveWidgetFocus, EMPTY_WIDGET_SNAPSHOT } from '../src/widgets/widgetData';
import type { Behavior, UrgeEvent } from '../src/data/types';

function makeBehavior(overrides: Partial<Behavior> = {}): Behavior {
  return {
    id: 'b1',
    name: 'Sigara',
    category: 'nicotine',
    verbUrge: 'Canım çekti',
    verbResist: 'Direndim',
    verbDid: 'İçtim',
    needsNameReview: false,
    color: 'indigo',
    icon: 'zap',
    goalMode: 'quit',
    unit: 'event',
    createdAt: new Date('2026-09-01T00:00:00.000Z').toISOString(),
    archived: false,
    cleanSinceAt: new Date('2026-09-01T00:00:00.000Z').toISOString(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<UrgeEvent> = {}): UrgeEvent {
  return {
    id: 'e1',
    behaviorId: 'b1',
    startedAt: new Date('2026-09-10T10:00:00.000Z').toISOString(),
    endedAt: null,
    intensity: null,
    intensityAfter: null,
    mood: null,
    triggers: [],
    location: null,
    company: null,
    note: null,
    outcome: 'resisted',
    outcomeUpdatedAt: null,
    delaySeconds: null,
    helpedByPlan: null,
    source: 'app',
    ...overrides,
  };
}

const NOW = new Date('2026-09-21T12:00:00.000Z');

test('widget: davranış yokken (silme sonrası) boş, güvenli bir anlık görüntü döner', () => {
  const snap = computeWidgetSnapshot([], [], null, NOW);
  assert.equal(snap.hasFocus, false);
  assert.equal(snap.behaviorName, null);
  assert.equal(snap.cleanLabel, null);
  assert.equal(snap.savingsLabel, null);
});

test('widget: tüm davranışlar arşivlenince de boş anlık görüntüye düşer', () => {
  const b = makeBehavior({ archived: true });
  const snap = computeWidgetSnapshot([b], [], null, NOW);
  assert.equal(snap.hasFocus, false);
});

test('widget: odak davranışı değişince anlık görüntü yeni davranışı yansıtır', () => {
  const b1 = makeBehavior({ id: 'b1', name: 'Sigara' });
  const b2 = makeBehavior({ id: 'b2', name: 'Telefon', createdAt: NOW.toISOString(), cleanSinceAt: NOW.toISOString() });

  const withB1 = computeWidgetSnapshot([b1, b2], [], 'b1', NOW);
  assert.equal(withB1.behaviorId, 'b1');
  assert.equal(withB1.behaviorName, 'Sigara');

  const withB2 = computeWidgetSnapshot([b1, b2], [], 'b2', NOW);
  assert.equal(withB2.behaviorId, 'b2');
  assert.equal(withB2.behaviorName, 'Telefon');
});

test('widget: tercih edilen odak artık yoksa (silinmiş/arşivlenmiş) en son etkinliğe düşer', () => {
  const b1 = makeBehavior({ id: 'b1', name: 'Sigara' });
  const b2 = makeBehavior({ id: 'b2', name: 'Telefon' });
  const ev = makeEvent({ behaviorId: 'b2' });
  const focus = resolveWidgetFocus([b1, b2], [ev], 'gone');
  assert.equal(focus?.id, 'b2');
});

test('widget: yeniden başlatma sonrası aynı veriden aynı anlık görüntü üretilir (belirsiz durum yok)', () => {
  const b = makeBehavior();
  const events = [makeEvent()];
  const first = computeWidgetSnapshot([b], events, 'b1', NOW);
  const second = computeWidgetSnapshot([b], events, 'b1', NOW);
  assert.deepEqual(first, second);
});

test('widget: hesaplama tamamen yerel/senkron — çevrimdışı kullanımda çökmez ya da beklemez', () => {
  const b = makeBehavior({ costPerUnit: 4, baselinePerDay: 10, costCurrency: '₺' });
  const result = computeWidgetSnapshot([b], [], 'b1', NOW);
  assert.equal(typeof result, 'object');
  assert.ok(result.savingsLabel);
});

test('widget: eski veri ekranda kalmaz — yeni bir olay eklenince tahmini birikim güncellenir, eskisiyle birleşmez', () => {
  const b = makeBehavior({ costPerUnit: 4, baselinePerDay: 10, costCurrency: '₺' });
  const before = computeWidgetSnapshot([b], [], 'b1', NOW);
  const after = computeWidgetSnapshot([b], [makeEvent({ outcome: 'acted' })], 'b1', NOW);
  assert.notEqual(before.savingsLabel, after.savingsLabel);
  assert.ok(new Date(after.updatedAt).getTime() >= new Date(before.updatedAt).getTime());
});

test('kilit ekranı: gizlilik tercihi kapalıyken davranış adı, temizlik süresi asla sızmaz', () => {
  const b = makeBehavior({ name: 'Gizli davranış' });
  const snap = computeWidgetSnapshot([b], [], 'b1', NOW);
  const lock = computeLockScreenSnapshot(snap, false);
  assert.equal(lock.sensitiveVisible, false);
  assert.equal(lock.behaviorName, null);
  assert.equal(lock.cleanLabel, null);
  assert.equal(lock.hasFocus, true); // still knows *something* is tracked, just not what
});

test('kilit ekranı: kullanıcı açıkça izin verince gerçek veriler görünür', () => {
  const b = makeBehavior({ name: 'Görünür davranış' });
  const snap = computeWidgetSnapshot([b], [], 'b1', NOW);
  const lock = computeLockScreenSnapshot(snap, true);
  assert.equal(lock.sensitiveVisible, true);
  assert.equal(lock.behaviorName, 'Görünür davranış');
  assert.ok(lock.cleanLabel);
});

test('boş anlık görüntü sabiti gerçekten boş', () => {
  assert.equal(EMPTY_WIDGET_SNAPSHOT.hasFocus, false);
  assert.equal(EMPTY_WIDGET_SNAPSHOT.behaviorName, null);
});
