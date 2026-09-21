import { useAppStore, CloseEventExtra } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { Behavior, EventSource } from '@/data/types';
import { shouldRunRecovery, actedOn } from '@/utils/journey';
import { todayKey } from '@/utils/date';

interface Opts {
  /** An already-open urge to close as "acted"; omitted = create a new record. */
  eventId?: string | null;
  source?: EventSource;
  extra?: CloseEventExtra;
  /** Where to go after a quiet log (default: stay). */
  afterQuiet?: () => void;
}

const recentActed = new Map<string, number>();
const DUPLICATE_GUARD_MS = 1200;

/**
 * The one place "yaptım / içtim" is recorded.
 *
 * A real slip ("bırak" mode, ≥24 h clean) opens the Relapse & Recovery flow.
 * Everything else — counting a cigarette in "azalt" mode, a second one an
 * hour after the first — is just a data point: one tap, a count, an undo.
 * §41: no haptic either way.
 */
export function commitActed(router: { replace: (href: any) => void }, behavior: Behavior, opts: Opts = {}): 'recovery' | 'quiet' | 'ignored' {
  const store = useAppStore.getState();

  if (!opts.eventId) {
    const now = Date.now();
    const previous = recentActed.get(behavior.id) ?? 0;
    if (now - previous < DUPLICATE_GUARD_MS) return 'ignored';
    recentActed.set(behavior.id, now);
  }

  if (shouldRunRecovery(behavior)) {
    router.replace({ pathname: '/relapse-recovery', params: { behaviorId: behavior.id, eventId: opts.eventId ?? '' } });
    return 'recovery';
  }

  let id = opts.eventId ?? null;
  if (id) {
    store.closeEvent(id, 'acted', opts.extra);
  } else {
    id = store.logEvent({ behaviorId: behavior.id, outcome: 'acted', source: opts.source ?? 'app' }).id;
  }

  const count = actedOn(useAppStore.getState().events, behavior.id, todayKey());
  const undoId = id;
  toast.show({
    message: `Bugün ${count} kayıt · ${behavior.verbDid}`,
    icon: 'check',
    actionLabel: 'Geri al',
    durationMs: 5000,
    onAction: () => {
      if (opts.eventId) useAppStore.getState().updateEvent(undoId, { outcome: null, outcomeUpdatedAt: null, endedAt: null });
      else useAppStore.getState().removeEvent(undoId);
    },
  });
  opts.afterQuiet?.();
  return 'quiet';
}
