import { create } from 'zustand';

interface FabState {
  /** Collapsed = icon-only pill; set by scrolling screens, read by the tab-level FAB. */
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const useFabStore = create<FabState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set((s) => (s.collapsed === collapsed ? s : { collapsed })),
}));
