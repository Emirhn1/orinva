export interface FirstDayState {
  progress: number;
  value: number;
  unit: 'dk' | 'sa';
  remaining: string;
  complete: boolean;
}

export function firstDayState(totalMinutes: number): FirstDayState {
  const elapsed = Math.max(0, Math.floor(totalMinutes));
  const complete = elapsed >= 1440;
  const remainingMinutes = Math.max(0, 1440 - elapsed);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const remaining = complete ? 'İlk hedef tamamlandı' : `${hours ? `${hours} sa` : ''}${hours && minutes ? ' ' : ''}${minutes ? `${minutes} dk` : ''} kaldı`;
  return { progress: Math.min(1, elapsed / 1440), value: elapsed < 60 ? elapsed : Math.min(24, Math.floor(elapsed / 60)), unit: elapsed < 60 ? 'dk' : 'sa', remaining, complete };
}
