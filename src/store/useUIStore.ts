import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

type Tab = "home" | "search" | "manage" | "sentences" | `words/${string}`;

type StickyNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
};

interface UIStore {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  stickyNotes: StickyNote[];
  addStickyNote: () => void;
  updateStickyNote: (id: string, content: string) => void;
  moveStickyNote: (id: string, x: number, y: number) => void;
  deleteStickyNote: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),

      stickyNotes: [],

      addStickyNote: () => {
        const palette = ["#FFF8B3", "#FFD6A5", "#CDEFF7", "#E0BBE4", "#D0F0C0"];
        const color = palette[Math.floor(Math.random() * palette.length)];
        const newNote: StickyNote = {
          id: uuidv4(),
          content: "## Ghi chú mới",
          x: 50 + Math.random() * 300,
          y: 50 + Math.random() * 150,
          color,
        };
        set({ stickyNotes: [...get().stickyNotes, newNote] });
      },

      updateStickyNote: (id, content) =>
        set({
          stickyNotes: get().stickyNotes.map((n) =>
            n.id === id ? { ...n, content } : n
          ),
        }),

      moveStickyNote: (id, x, y) =>
        set({
          stickyNotes: get().stickyNotes.map((n) =>
            n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n
          ),
        }),

      deleteStickyNote: (id) =>
        set({
          stickyNotes: get().stickyNotes.filter((n) => n.id !== id),
        }),
    }),
    {
      name: "ui-store", // key lưu trong localStorage
      partialize: (state) => ({
        stickyNotes: state.stickyNotes,
        activeTab: state.activeTab,
      }),
    }
  )
);
