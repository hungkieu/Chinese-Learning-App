import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ReadingQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ReadingItem {
  id: string;
  title: string;
  sentences: string[];
  meaning: string;
  questions: ReadingQuestion[];
  createdAt: Date;
}

interface ReadingLibraryStore {
  readings: ReadingItem[];
  currentReadingId: string | null;
  setCurrentReadingId: (id: string | null) => void;
  addReading: (item: ReadingItem) => void;
  updateReading: (id: string, updated: Partial<ReadingItem>) => void;
  removeReading: (id: string) => void;
  clearAll: () => void;
  getReadingById: (id: string) => ReadingItem | undefined;
}

export const useReadingLibraryStore = create<ReadingLibraryStore>()(
  persist(
    (set, get) => ({
      readings: [],
      currentReadingId: null,
      setCurrentReadingId: (id) => set({ currentReadingId: id }),

      addReading: (item) =>
        set((state) => ({
          readings: [item, ...state.readings],
        })),

      updateReading: (id, updated) =>
        set((state) => ({
          readings: state.readings.map((r) =>
            r.id === id ? { ...r, ...updated } : r
          ),
        })),

      removeReading: (id) =>
        set((state) => ({
          readings: state.readings.filter((r) => r.id !== id),
          currentReadingId:
            get().currentReadingId === id ? null : get().currentReadingId,
        })),

      clearAll: () => set({ readings: [], currentReadingId: null }),

      getReadingById: (id) => get().readings.find((r) => r.id === id),
    }),
    {
      name: "reading-library",
      partialize: (state) => ({
        readings: state.readings.map((r) => ({
          ...r,
          createdAt:
            r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        })),
        currentReadingId: state.currentReadingId,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        readings: (persistedState?.readings || []).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        })),
      }),
    }
  )
);
