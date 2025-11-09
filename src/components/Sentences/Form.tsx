import { useEffect, useState } from "react";
import { openaiClient } from "@/lib/openAIClient";
import { useDailyWords } from "@/store/useMyWordsStore";
import { JSON_INSTRUCTION } from "@/consts";
import { buildPrompt } from "./prompts";
import { useReadingStore } from "@/store/useReadingStore";
import { useReadingLibraryStore } from "@/store/useReadingLibraryStore";
import { Loader2, Bookmark, Trash2 } from "lucide-react";
import Checkbox from "../common/Checkbox";

type FormProps = {
  ttsAbortRef: React.MutableRefObject<AbortController | null>;
  showAfterCreate: boolean;
  setShowAfterCreate: (v: boolean) => void;
  onSaveClick?: () => void;
  hasResult?: boolean;
};

const Form = ({
  ttsAbortRef,
  showAfterCreate,
  setShowAfterCreate,
  onSaveClick,
  hasResult = false,
}: FormProps) => {
  const dailyWords = useDailyWords();
  const {
    result,
    audioUrl,
    loading,
    setResult,
    setLoading,
    setError,
    setAudioUrl,
    setTtsLoading,
    setTtsError,
  } = useReadingStore();

  const readings = useReadingLibraryStore((s) => s.readings);
  const removeReading = useReadingLibraryStore((s) => s.removeReading);
  const currentReadingId = useReadingLibraryStore((s) => s.currentReadingId);

  const [userInput, setUserInput] = useState("");
  const [hskLevel, setHskLevel] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!result) {
      setIsSaved(false);
      return;
    }
    const found = readings.some(
      (r) =>
        (currentReadingId && r.id === currentReadingId) ||
        (JSON.stringify(r.sentences) === JSON.stringify(result.sentences) &&
          r.meaning === result.meaning)
    );
    setIsSaved(found);
  }, [result, readings, currentReadingId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAudioUrl(null);
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTtsLoading(false);
    setTtsError("");
    try {
      const resp = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        instructions: JSON_INSTRUCTION,
        input: buildPrompt({ dailyWords, userInput, hskLevel }),
        temperature: 0.8,
      });
      const text =
        resp.output_text ?? resp.output?.[0]?.content?.[0]?.text ?? "";
      const jsonData = JSON.parse(text);
      setResult(jsonData);
    } catch {
      setError("Không thể tạo nội dung. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full mb-4">
        <input
          type="text"
          placeholder={
            dailyWords.length > 0
              ? "Kết hợp từ đã chọn, tạo đoạn văn theo nội dung..."
              : "Nội dung đoạn văn muốn tạo..."
          }
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((lvl) => (
          <button
            key={lvl}
            onClick={() =>
              hskLevel === lvl ? setHskLevel(null) : setHskLevel(lvl)
            }
            className={`px-3 py-1 rounded-lg ${
              hskLevel === lvl
                ? "bg-green-one text-white hover:scale-110 transition-all"
                : "bg-green-gray text-white hover:scale-110 transition-all"
            }`}
          >
            HSK {lvl}
          </button>
        ))}
      </div>

      <label className="mb-4 flex items-center gap-2 select-none">
        <Checkbox
          checked={showAfterCreate}
          onChange={(e) => setShowAfterCreate(e)}
        />
        <span className="text-sm text-gray-700">Ẩn script sau khi tạo</span>
      </label>

      <div className="mb-6 flex justify-center items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-green-one text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-all hover:scale-110 active:scale-95"
        >
          {loading && (
            <Loader2 className="animate-spin inline-block mr-2" size={18} />
          )}
          Tạo bài đọc
        </button>

        {hasResult && (
          <>
            <button
              onClick={() => {
                if (!isSaved && onSaveClick) onSaveClick();
              }}
              title={isSaved ? "Đã lưu bài đọc" : "Lưu bài đọc này"}
              className={`transition-all hover:scale-105 active:scale-95 ${
                isSaved
                  ? "border-yellow-400 bg-yellow-100 text-yellow-500"
                  : "border-green-one text-green-one hover:bg-green-50"
              }`}
            >
              <Bookmark
                size={20}
                className={isSaved ? "fill-yellow-400" : "fill-none"}
              />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Form;
