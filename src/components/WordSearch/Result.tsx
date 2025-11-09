import { Plus, Check, PlusCircle, Speech } from "lucide-react";
import { useState, useEffect } from "react";
import { useAddWord, useWords } from "@/store/useMyWordsStore";
import { AnimatePresence, motion } from "framer-motion";
import { speakWord } from "../TestSession/utils";

const Result = (props: { result: HSKWord[] }) => {
  const { result } = props;
  const [added, setAdded] = useState<Record<number, boolean>>({});

  const myWords = useWords();
  const addWord = useAddWord();

  useEffect(() => {
    const markExisting = (items: HSKWord[], offset = 0) => {
      const initial: Record<number, boolean> = {};
      items.forEach((item, index) => {
        const exists = myWords.some(
          (word) => word.word.trim() === item.chinese.trim()
        );
        if (exists) {
          initial[offset + index] = true;
        }
      });
      return initial;
    };

    if (!result) {
      setAdded({});
      return;
    }

    if (Array.isArray(result)) {
      setAdded(markExisting(result));
    } else {
      setAdded(markExisting([result]));
    }
  }, [result, myWords]);

  const handleAddWord = (wordItem: HSKWord, index: number) => {
    const success = addWord({
      word: wordItem.chinese,
      pinyin: wordItem.pinyin,
      meanings: [wordItem.vietnamese],
    });

    if (success) {
      console.log("Thêm thành công!");
      setAdded((prev) => ({ ...prev, [index]: true }));
    } else {
      alert("Từ này đã tồn tại trong bộ từ!");
    }
  };

  return (
    <div className="space-y-4">
      {Array.isArray(result) ? (
        result.map((item, index) => (
          <div
            key={index}
            className="border border-dashed border-green-one rounded-xl p-4 bg-white flex"
          >
            <div className="flex flex-col w-full">
              <Speech
                className="hover:scale-105 cursor-pointer"
                onClick={() => speakWord(item.chinese)}
              />
              <p className="text-2xl font-bold text-gray-900">{item.chinese}</p>
              <p className="text-gray-600 italic">{item.pinyin}</p>
              <p className="text-gray-800">{item.vietnamese}</p>
            </div>
            <button
              onClick={() => handleAddWord(item, index)}
              className={`mt-2 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                added[index]
                  ? "text-pink-500 pointer-events-none"
                  : "text-green-one hover:scale-110 active:scale-95"
              }`}
            >
              <AnimatePresence mode="wait">
                {added[index] ? (
                  <motion.div
                    key="check"
                    initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Check size={32} />
                  </motion.div>
                ) : (
                  <motion.div
                    exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PlusCircle size={32} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        ))
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div>
            <Speech
              className="hover:scale-105 cursor-pointer"
              onClick={() => speakWord(result.chinese)}
            />
            <p className="text-2xl font-bold text-gray-900">{result.chinese}</p>
            <p className="text-gray-600 italic">{result.pinyin}</p>
            <p className="text-gray-800">{result.vietnamese}</p>
          </div>
          {result.examples && result.examples.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Ví dụ:</h4>
              {result.examples.map((ex, i) => (
                <div key={i} className="mb-2">
                  <p className="text-gray-900">{ex.chinese}</p>
                  <p className="text-gray-600 text-sm">{ex.vietnamese}</p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => handleAddWord(result, 0)}
            className={`mt-2 w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              added[0]
                ? "bg-pink-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {added[0] ? (
              <>
                <Check size={16} />
                Thêm thành công 🎉
              </>
            ) : (
              <>
                <Plus size={16} />
                Thêm vào bộ từ của tôi
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Result;
