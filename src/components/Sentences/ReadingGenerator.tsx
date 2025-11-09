import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2, CircleChevronLeft } from "lucide-react";
import ChineseSentence from "@/components/ChineseSentence";
import AudioPlayer from "@/components/AudioPlayer";
import { speak } from "@/lib/tts";
import { useReadingStore } from "@/store/useReadingStore";
import { useReadingLibraryStore } from "@/store/useReadingLibraryStore";
import { v4 as uuidv4 } from "uuid";
import Form from "./Form";
import Modal from "@/components/common/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { CORRECT_MESSAGES, FAILED_MESSAGES } from "@/consts";
import confetti from "canvas-confetti";

type Props = {
  onBack?: () => void;
};

const ReadingGenerator = ({ onBack }: Props) => {
  const {
    result,
    audioUrl,
    ttsLoading,
    error,
    ttsError,
    setAudioUrl,
    setTtsLoading,
    setTtsError,
  } = useReadingStore();

  const addReading = useReadingLibraryStore((s) => s.addReading);

  const [showMeaning, setShowMeaning] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    result?.questions ? Array(result.questions.length).fill(null) : []
  );
  const [showAfterCreate, setShowAfterCreate] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");

  const ttsAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSaveTitle("");
    if (result?.questions) {
      setSelectedAnswers(Array(result.questions.length).fill(null));
    }
  }, [result]);

  useEffect(() => {
    setShowMeaning(false);

    const runTTS = async () => {
      if (!result || !result.sentences?.length) {
        setTtsError("");
        return;
      }

      setTtsError("");
      setTtsLoading(true);

      if (ttsAbortRef.current) ttsAbortRef.current.abort();
      const controller = new AbortController();
      ttsAbortRef.current = controller;

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      try {
        const textToRead = result.sentences.join(" ");
        if (!textToRead.trim()) {
          setTtsLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        const { url } = await speak({
          text: textToRead,
          model: "tts-1",
          voice: "alloy",
          format: "mp3",
          autoplay: false,
          signal: controller.signal,
        });

        if (url) setAudioUrl(url);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("TTS error:", err);
          if (result?.sentences?.length)
            setTtsError("Không tạo được audio đọc đoạn văn.");
        }
      } finally {
        setTtsLoading(false);
      }
    };

    const timer = setTimeout(runTTS, 500);
    return () => {
      clearTimeout(timer);
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
        ttsAbortRef.current = null;
      }
    };
  }, [result]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleSaveReading = () => {
    if (!result) return;

    const item = {
      id: uuidv4(),
      title: saveTitle || "Bài đọc không tên",
      sentences: result.sentences,
      meaning: result.meaning,
      questions: result.questions,
      createdAt: new Date(),
    };
    addReading(item);
    setShowSaveModal(false);
  };

  return (
    <>
      <div
        className="flex items-center mb-4 gap-2 cursor-pointer"
        onClick={onBack}
      >
        <CircleChevronLeft /> Quay lại danh sách bài đọc
      </div>

      <Form
        ttsAbortRef={ttsAbortRef}
        showAfterCreate={showAfterCreate}
        setShowAfterCreate={setShowAfterCreate}
        hasResult={!!result}
        onSaveClick={() => setShowSaveModal(true)}
      />

      <Modal
        isOpen={showSaveModal}
        setOpen={setShowSaveModal}
        title="Lưu bài đọc"
        okText="Lưu"
        cancelText="Hủy"
        onOk={handleSaveReading}
      >
        <label className="block text-green-950 font-medium mb-2">
          Nhập tiêu đề bài đọc:
        </label>
        <input
          type="text"
          placeholder="Ví dụ: Câu chuyện về chú mèo nhỏ"
          value={saveTitle}
          onChange={(e) => setSaveTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-one"
        />
      </Modal>

      <div className="min-h-[200px]">
        {error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : result ? (
          <div className="space-y-6">
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="text-pink-600" size={18} />
                <span className="font-medium text-gray-800">Nghe đoạn văn</span>
                {ttsLoading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-sm text-gray-600">
                    <Loader2 className="animate-spin" size={14} /> Đang tạo
                    audio…
                  </span>
                )}
                {ttsError && (
                  <span className="ml-2 text-sm text-red-600">{ttsError}</span>
                )}
              </div>

              {audioUrl ? (
                <AudioPlayer
                  src={audioUrl}
                  title="Bài đọc tiếng Trung (TTS)"
                  initialVolume={0.9}
                />
              ) : (
                !ttsLoading && (
                  <p className="text-sm text-gray-500">
                    Nhấn “Tạo bài đọc” để sinh audio.
                  </p>
                )
              )}
            </div>

            <div className="flex flex-col bg-orange-light p-4 rounded-xl gap-4">
              <div className="flex justify-start gap-4 cursor-pointer">
                <button
                  className="flex place-content-center px-3 py-1 rounded-lg bg-green-gray text-white font-bold hover:scale-105 transition-all"
                  onClick={() => setShowAfterCreate(!showAfterCreate)}
                >
                  {!showAfterCreate ? "Ẩn bài đọc" : "Hiển thị bài đọc"}
                </button>
                {!showAfterCreate && (
                  <button
                    onClick={() => setShowMeaning(!showMeaning)}
                    className="flex place-content-center px-3 py-1 rounded-lg bg-green-gray text-white font-bold hover:scale-105 transition-all"
                  >
                    {showMeaning ? "Ẩn dịch" : "Hiện dịch"}
                  </button>
                )}
              </div>

              {!showAfterCreate && (
                <>
                  <div className="space-y-2 text-left text-xl leading-relaxed">
                    {result.sentences.map((line: string, i: number) => (
                      <ChineseSentence key={i} sentence={line} />
                    ))}
                  </div>
                  {showMeaning && (
                    <p className="mt-2 text-green-one text-base">
                      {result.meaning}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 pt-6">
              <h3 className="text-left text-lg font-semibold mb-4 text-green-950">
                Câu hỏi trắc nghiệm
              </h3>
              {result.questions.map((q: any, idx: number) => {
                const selected = selectedAnswers[idx];
                const correctIndex =
                  (q.answer ?? "")
                    .toString()
                    .trim()
                    .toUpperCase()
                    .charCodeAt(0) - 65;
                const isAnswered = selected !== null;

                const handleSelect = (i: number) => {
                  if (isAnswered) return;
                  const updated = [...selectedAnswers];
                  updated[idx] = i;
                  if (i === correctIndex) {
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.8 },
                    });
                  }
                  setSelectedAnswers(updated);
                };

                return (
                  <div key={idx} className="mb-6 pb-4">
                    <div className="flex gap-2 font-medium text-lg text-green-950">
                      <span className="shrink-0">{idx + 1}.</span>
                      <div className="flex-1">
                        <ChineseSentence sentence={q.question} />
                      </div>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {q.options.map((opt: string, i: number) => {
                        const isCorrect = i === correctIndex;
                        const isSelected = i === selected;
                        const isWrongSelected =
                          isAnswered && isSelected && !isCorrect;
                        const baseClass =
                          "flex items-start gap-2 rounded px-3 py-2 text-green-950 cursor-pointer transition-all duration-200";
                        let colorClass = "bg-orange-light hover:bg-orange-200";
                        if (isAnswered) {
                          if (isCorrect && isSelected)
                            colorClass = "bg-green-200";
                          else if (isCorrect) colorClass = "bg-green-200";
                          else if (isSelected) colorClass = "bg-red-200";
                        }
                        return (
                          <motion.li
                            key={i}
                            onClick={() => handleSelect(i)}
                            className={`${baseClass} ${colorClass}`}
                            animate={
                              isWrongSelected
                                ? { x: [0, -8, 8, -8, 8, 0] }
                                : { x: 0 }
                            }
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          >
                            <span className="shrink-0">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <div className="flex-1">
                              <ChineseSentence sentence={opt} />
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          key="feedback"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 text-sm"
                        >
                          <motion.p
                            className="text-green-one text-xl mt-2"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            {selected === correctIndex
                              ? CORRECT_MESSAGES[
                                  Math.floor(
                                    Math.random() * CORRECT_MESSAGES.length
                                  )
                                ]
                              : FAILED_MESSAGES[
                                  Math.floor(
                                    Math.random() * FAILED_MESSAGES.length
                                  )
                                ]}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <p className="text-green-gray text-left">
              Cách 1. Chọn từ trong kho từ vựng, nhập nội dung đoạn văn (nếu
              có), chọn cấp độ HSK (nếu thích) cho bài đọc, rồi nhấn “Tạo bài
              đọc”.
            </p>
            <p className="text-green-gray text-left mt-2">
              Cách 2. Chọn cấp độ HSK, rồi nhấn “Tạo bài đọc" để tạo ngẫu nhiên.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ReadingGenerator;
