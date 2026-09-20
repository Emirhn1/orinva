import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A clock that ticks every `intervalMs` (default: once a minute, aligned to
 * the next minute boundary) and immediately when the app returns to the
 * foreground — so live counters (clean time, milestone ring, delay timer)
 * never show a stale value after the phone was locked.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      const delay = intervalMs >= 60_000 ? intervalMs - (Date.now() % intervalMs) : intervalMs;
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, delay);
    };
    schedule();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });

    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [intervalMs]);

  return now;
}
