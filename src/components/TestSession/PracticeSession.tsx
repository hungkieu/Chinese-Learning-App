// PracticeSession.tsx
import { useState, useMemo, useEffect } from "react";
import { Speech } from "lucide-react";
import { useWords } from "@/store/useMyWordsStore";
import Button from "@/components/common/Button";
import { speakWord, debounce } from "./utils";
import FinishTest from "./FinishTest";

interface Props {
  selectedIds: string[];
  onExit: () => void;
}

const PracticeSession = ({ selectedIds, onExit }: Props) => {
  const words = useWords();
  const initialQueue = useMemo(
    () => words.filter((w) => selectedIds.includes(w.id)),
    [selectedIds, words]
  );

  const [queue, setQueue] = useState(initialQueue);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = queue[0];

  const handleShowAnswer = () => {
    if (!currentCard) return;
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (!currentCard) return;
    setQueue((prev) => prev.slice(1));
    setUserAnswer("");
    setShowAnswer(false);
  };

  useEffect(() => {
    const onKeyDown = debounce((e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!showAnswer) {
        if (userAnswer.trim().length > 0) {
          e.preventDefault();
          handleShowAnswer();
        }
        return;
      }
      e.preventDefault();
      handleNext();
    }, 300);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAnswer, userAnswer]);

  if (queue.length === 0) return <FinishTest onExit={onExit} />;

  return (
    <div className="relative bg-white rounded-xl px-4 pt-20 pb-4 w-full max-w-md mx-auto bg-ribbon">
      <div className="text-center">
        {showAnswer && (
          <p className="flex justify-center text-green-gray mb-2">
            <Speech
              className="hover:scale-105 cursor-pointer"
              onClick={() => speakWord(currentCard.word)}
            />
          </p>
        )}

        <p className="text-4xl font-bold mb-2 text-red-400">
          {currentCard.word}
        </p>

        {!showAnswer && (
          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Nhập nghĩa tiếng Việt..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <div className="flex gap-4 mt-3">
              <Button onClick={onExit}>Thoát</Button>
              <Button onClick={handleShowAnswer}>Xem</Button>
              <Button onClick={handleShowAnswer} disabled={!userAnswer.trim()}>
                Kiểm tra
              </Button>
            </div>
          </div>
        )}

        {showAnswer && (
          <>
            <p className="flex items-center justify-center gap-2 text-green-950 text-xl italic mb-1">
              {currentCard.pinyin}
            </p>
            <p className="text-green-950 text-xl font-semibold mb-2">
              {currentCard.meanings.join(", ")}
            </p>
            <button
              onClick={handleNext}
              className="bg-green-one hover:scale-110 active:scale-95 text-white text-lg font-bold px-4 py-2 rounded-lg transition-all"
            >
              Tiếp theo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeSession;
