import { useState, useEffect, useCallback, useRef } from "react";
import { Speech } from "lucide-react";
import { useWords, useUpdateWord } from "@/store/useMyWordsStore";
import Button from "@/components/common/Button";
import { CORRECT_MESSAGES, FAILED_MESSAGES } from "@/consts";
import confetti from "canvas-confetti";
import { speakWord, getRandom, rand, debounce } from "./utils";
import FinishTest from "./FinishTest";
import SmileSvg from "./SmileSvg";
import SadSvg from "./SadSvg";
import clsx from "clsx";

interface Props {
  selectedIds: string[];
  onExit: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = JSON.parse(JSON.stringify(array));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ExamSession = ({ selectedIds, onExit }: Props) => {
  const words = useWords();
  const updateWord = useUpdateWord();

  const shuffledInitial = useRef(
    shuffle(words.filter((w) => selectedIds.includes(w.id)))
  );

  const [queue, setQueue] = useState(shuffledInitial.current);
  const [userAnswer, setUserAnswer] = useState("");
  const [viewState, setViewState] = useState<
    "question" | "feedback" | "answer"
  >("question");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answeredCard, setAnsweredCard] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [stats, setStats] = useState(() => ({
    correctCount: 0,
    wrongCount: 0,
    dontKnowCount: 0,
    perWord: {} as Record<
      string,
      { correct: number; wrong: number; dontknow: number; word?: string }
    >,
  }));

  const currentCard = queue[0];
  const inputRef = useRef<HTMLInputElement>(null);

  const updateReviewStats = (id: string, correct: boolean) => {
    const word = words.find((w) => w.id === id);
    if (!word) return;
    updateWord(id, {
      accuracy: {
        correct: correct ? word.accuracy.correct + 1 : word.accuracy.correct,
        incorrect: !correct
          ? word.accuracy.incorrect + 1
          : word.accuracy.incorrect,
      },
      lastReviewed: new Date(),
      testCount: word.testCount + 1,
    });
  };

  const openFeedbackThenAnswer = useCallback((correct: boolean) => {
    setFeedbackText(
      correct ? getRandom(CORRECT_MESSAGES) : getRandom(FAILED_MESSAGES)
    );
    setViewState("feedback");
  }, []);

  const handleCheckAnswer = () => {
    if (!currentCard) return;
    const normalizedAnswer = (inputRef.current?.value ?? userAnswer)
      .trim()
      .toLowerCase();
    const correct = currentCard.meanings.some((m: string) =>
      m.trim().toLowerCase().includes(normalizedAnswer)
    );
    setIsCorrect(correct);
    setAnsweredCard({ ...currentCard, correct });
    setStats((prev) => {
      const existing = prev.perWord[currentCard.id] || {
        correct: 0,
        wrong: 0,
        dontknow: 0,
      };
      return {
        ...prev,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        wrongCount: prev.wrongCount + (!correct ? 1 : 0),
        perWord: {
          ...prev.perWord,
          [currentCard.id]: {
            ...existing,
            correct: existing.correct + (correct ? 1 : 0),
            wrong: existing.wrong + (!correct ? 1 : 0),
            word: currentCard.word,
          },
        },
      };
    });
    updateReviewStats(currentCard.id, correct);
    if (correct) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
    }
    openFeedbackThenAnswer(correct);
  };

  const handleDontKnow = () => {
    if (!currentCard) return;
    setIsCorrect(false);
    setAnsweredCard({ ...currentCard, correct: false });
    setStats((prev) => {
      const existing = prev.perWord[currentCard.id] || {
        correct: 0,
        wrong: 0,
        dontknow: 0,
      };
      return {
        ...prev,
        dontKnowCount: prev.dontKnowCount + 1,
        perWord: {
          ...prev.perWord,
          [currentCard.id]: {
            ...existing,
            dontknow: existing.dontknow + 1,
            word: currentCard.word,
          },
        },
      };
    });
    updateReviewStats(currentCard.id, false);
    setViewState("answer");
  };

  const proceedFromFeedback = () => {
    setViewState("answer");
  };

  const handleNext = () => {
    if (!answeredCard) return;
    if (answeredCard.correct) {
      setQueue((prev) => prev.slice(1));
    } else {
      setQueue((prev) => [...prev.slice(1), prev[0]]);
    }
    setUserAnswer("");
    setViewState("question");
    setIsCorrect(null);
    setAnsweredCard(null);
    setFeedbackText("");
  };

  useEffect(() => {
    const onKeyDown = debounce((e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (viewState === "feedback") {
        e.preventDefault();
        proceedFromFeedback();
        return;
      }
      if (viewState === "question") {
        if (userAnswer.trim().length > 0) {
          e.preventDefault();
          handleCheckAnswer();
        }
        return;
      }
      if (viewState === "answer") {
        e.preventDefault();
        handleNext();
        return;
      }
    }, 300);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewState, userAnswer]);

  if (queue.length === 0) return <FinishTest stats={stats} onExit={onExit} />;

  const decoDirection: Record<string, string> = {
    a1: "bottom-0 left-4",
    a2: "bottom-0 left-0",
    a3: "bottom-0 right-0",
    b1: "-bottom-17 -left-3 md:-bottom-30 md:-left-20",
    b3: "-bottom-5 -left-10 md:-bottom-5 md:-left-30",
    b6: "bottom-0 -right-5 md:-right-10",
  };

  const deco = isCorrect ? `a${rand(1, 3)}` : `b${rand(1, 6)}`;

  return (
    <div
      className={clsx(
        "relative bg-white rounded-xl px-4 pt-20 pb-4 w-full max-w-md mx-auto",
        {
          "bg-ribbon":
            viewState === "question" || (viewState === "answer" && isCorrect),
          "mt-10": viewState === "feedback" || !isCorrect,
        }
      )}
    >
      {viewState === "feedback" && (
        <div className="flex flex-col items-center justify-center text-center">
          {isCorrect ? <SmileSvg /> : <SadSvg />}
          <p className="text-green-950 text-3xl leading-relaxed mb-6">
            {feedbackText}
          </p>
          <Button onClick={proceedFromFeedback} className="w-auto">
            {">>>>"}
          </Button>
        </div>
      )}

      {viewState !== "feedback" && (
        <div className="text-center">
          {viewState === "answer" && (
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

          {viewState === "question" && (
            <div className="flex flex-col items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập nghĩa tiếng Việt..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <div className="flex gap-4 mt-3">
                <Button onClick={onExit}>Thoát</Button>
                <Button onClick={handleDontKnow}>Xem</Button>
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer.trim()}
                >
                  Kiểm tra
                </Button>
              </div>
            </div>
          )}

          {viewState === "answer" && (
            <div className="flex flex-col items-center justify-center text-center">
              {!isCorrect && <SadSvg />}
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
            </div>
          )}

          {viewState === "answer" && (
            <div
              className={clsx(
                "absolute pointer-events-none",
                decoDirection[deco] ?? "bottom-0 right-0"
              )}
            >
              <img
                className={clsx(deco === "b4" ? "h-30" : "h-30 md:h-40")}
                src={`/${deco}.png`}
                alt="decorative"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamSession;
