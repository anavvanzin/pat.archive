import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BuddyState {
  activeItems: string[];
  auraColor: string;
  dragPosition: { x: number; y: number };
  setActiveItems: (items: string[]) => void;
  setAuraColor: (color: string) => void;
  setDragPosition: (position: { x: number; y: number }) => void;
}

export const useBuddyStore = create<BuddyState>()(
  persist(
    (set) => ({
      activeItems: [],
      auraColor: '#ffffff',
      dragPosition: { x: 0, y: 0 },
      setActiveItems: (activeItems) => set({ activeItems }),
      setAuraColor: (auraColor) => set({ auraColor }),
      setDragPosition: (dragPosition) => set({ dragPosition }),
    }),
    {
      name: 'melo-buddy-storage',
    }
  )
);
