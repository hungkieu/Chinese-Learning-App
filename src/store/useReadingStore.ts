import { create } from "zustand";

export type ReadingResult = {
  sentences: string[];
  meaning: string;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
};

type ReadingStore = {
  result: ReadingResult | null; // kết quả hiện tại
  audioUrl: string | null;      // blob URL audio hiện tại
  loading: boolean;             // đang gọi AI (generate)
  ttsLoading: boolean;          // đang tạo TTS
  error: string;                // lỗi generate
  ttsError: string;             // lỗi TTS

  setResult: (r: ReadingResult | null) => void;
  setAudioUrl: (url: string | null) => void;

  setLoading: (v: boolean) => void;
  setTtsLoading: (v: boolean) => void;

  setError: (msg: string) => void;
  setTtsError: (msg: string) => void;

  clear: () => void;            // xoá kết quả + audio
};

export const useReadingStore = create<ReadingStore>((set) => ({
  result: null,
  audioUrl: null,
  loading: false,
  ttsLoading: false,
  error: "",
  ttsError: "",

  setResult: (r) => set({ result: r }),
  setAudioUrl: (url) => set({ audioUrl: url }),

  setLoading: (v) => set({ loading: v }),
  setTtsLoading: (v) => set({ ttsLoading: v }),

  setError: (msg) => set({ error: msg }),
  setTtsError: (msg) => set({ ttsError: msg }),

  clear: () => set({
    result: null,
    audioUrl: null,
    loading: false,
    ttsLoading: false,
    error: "",
    ttsError: "",
  }),
}));
