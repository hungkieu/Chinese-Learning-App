import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useMyWordsStore = create<WordStore>()(
  persist(
    (set, get) => ({
      words: [],
      dailyWords: [],
      highlightWords: [],

      setDailyWords: (words: Word[]) => {
        set({ dailyWords: words });
      },
      setHighlightWords: (words: Word[]) => {
        set({ highlightWords: words });
      },

      addWord: (wordObj: NewWord): boolean => {
        const currentWords = get().words;

        const exists = currentWords.some(
          (w) => w.word.trim() === wordObj.word.trim()
        );

        if (exists) {
          console.warn(`Từ "${wordObj.word}" đã tồn tại, không thêm mới.`);
          return false;
        }

        const id = uuidv4();
        const newWord: Word = {
          ...wordObj,
          id,
          testCount: 0,
          accuracy: { correct: 0, incorrect: 0 },
          lastReviewed: null,
        };

        set({ words: [...currentWords, newWord] });
        return true;
      },

      updateWord: (id: string, updatedWord: Partial<Word>) => {
        set({
          words: get().words.map((w) =>
            w.id === id ? { ...w, ...updatedWord } : w
          ),
        });
      },

      removeWord: (id: string) => {
        set({ words: get().words.filter((w) => w.id !== id) });
      },
    }),
    {
      name: "my-words-storage",
      partialize: (state) => ({
        words: state.words,
      }),
    }
  )
);

// ---- hooks ----
export const useWords = () => useMyWordsStore((state) => state.words);
export const useWordById = (id: string) =>
  useMyWordsStore((state) => state.words.find((w) => w.id === id));

export const useDueWords = () =>
  useMyWordsStore((state) => {
    const today = new Date();
    return state.words.filter((w) => {
      const lastReviewed =
        typeof w.lastReviewed === "string"
          ? new Date(w.lastReviewed)
          : w.lastReviewed;
      return !lastReviewed || lastReviewed <= today;
    });
  });

export const useWordCount = () => useMyWordsStore((state) => state.words.length);
export const useAddWord = () => useMyWordsStore((state) => state.addWord);
export const useUpdateWord = () => useMyWordsStore((state) => state.updateWord);
export const useRemoveWord = () => useMyWordsStore((state) => state.removeWord);

export const useDailyWords = () => useMyWordsStore((state) => state.dailyWords);
export const useSetDailyWords = () =>
  useMyWordsStore((state) => state.setDailyWords);

export const useHighlightWords = () =>
  useMyWordsStore((state) => state.highlightWords);
export const useSetHighlightWords = () =>
  useMyWordsStore((state) => state.setHighlightWords);
