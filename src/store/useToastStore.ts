import { create } from 'zustand';

export interface ToastSpec {
  id: number;
  message: string;
  icon?: 'check' | 'info' | 'alert-circle' | 'refresh-cw' | 'bell' | 'heart';
  tone?: 'neutral' | 'success' | 'terracotta';
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastState {
  current: ToastSpec | null;
  show: (spec: Omit<ToastSpec, 'id'>) => void;
  dismiss: () => void;
}

let seq = 0;

/**
 * One toast at a time, app-wide (DESIGN.md §19). The host lives in the root
 * layout so a toast fired from a sheet survives the sheet closing — this is
 * what makes "Kaydedildi · Geri al" work after quick-log dismisses itself.
 */
export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (spec) => set({ current: { ...spec, id: ++seq } }),
  dismiss: () => set({ current: null }),
}));

export const toast = {
  show: (spec: Omit<ToastSpec, 'id'>) => useToastStore.getState().show(spec),
  dismiss: () => useToastStore.getState().dismiss(),
};
