interface Word {
  id: string;
  word: string;                 // Từ gốc
  pinyin: string;               // Phiên âm
  meanings: string[];           // Danh sách nhiều nghĩa
  testCount: number;            // Số lần xuất hiện trong bài kiểm tra
  accuracy: {
    correct: number;            // % trả lời đúng (0 - 100)
    incorrect: number;          // % trả lời sai (0 - 100)
  };
  lastReviewed: Date | null;    // Lần cuối được xem qua, null nếu chưa từng xem
}

type NewWord = Omit<Word, "id" | "testCount" | "accuracy" | "lastReviewed">;

interface WordStore {
  words: Word[];
  dailyWords: Word[];
  highlightWords: Word[];
  addWord: (wordObj: NewWord) => boolean;
  updateWord: (id: string, word: Partial<Word>) => void;
  removeWord: (id: string) => void;
  setDailyWords: (words: Word[]) => void;
  setHighlightWords: (words: Word[]) => void;
}

interface HSKWord {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}
