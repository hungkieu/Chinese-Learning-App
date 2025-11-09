import { PlusCircle, Check, Speech } from "lucide-react";
import { useState } from "react";
import hsk1 from "@/json/hsk1.json";
import hsk2 from "@/json/hsk2.json";
import hsk3 from "@/json/hsk3.json";
import hsk4 from "@/json/hsk4.json";
import hsk5 from "@/json/hsk5.json";
import hsk6 from "@/json/hsk6.json";
import { AnimatePresence, motion } from "framer-motion";
import { useWords, useAddWord } from "@/store/useMyWordsStore";
import Dropdown from "../common/Dropdown";
import { speakWord } from "../TestSession/utils";

const RandomWords = () => {
  const [words, setWords] = useState<NewWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hskLevel, setHskLevel] = useState<number | undefined>(1);
  const myWords = useWords();
  const addWord = useAddWord();

  const getRandomItems = (arr: HSKWord[], count: number) => {
    setAdded({});
    const available = arr.filter(
      (item) => !myWords.some((w) => w.word === item.chinese)
    );
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleAddNewWord = () => {
    setLoading(true);
    try {
      const hsk =
        hskLevel === 1
          ? hsk1
          : hskLevel === 2
          ? hsk2
          : hskLevel === 3
          ? hsk3
          : hskLevel === 4
          ? hsk4
          : hskLevel === 5
          ? hsk5
          : hskLevel === 6
          ? hsk6
          : [];
      const randomWords = getRandomItems(hsk, 6);
      const formatted = randomWords.map((item) => ({
        word: item.chinese,
        pinyin: item.pinyin,
        meanings: [item.vietnamese],
      }));
      setWords(formatted);
    } catch (error) {
      console.error("Error selecting words:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const [added, setAdded] = useState<Record<number, boolean>>({});

  const handleAddToMyWords = (item: NewWord, index: number) => {
    const success = addWord(item);

    if (success) {
      console.log("Thêm thành công!");
    } else {
      alert("Từ này đã tồn tại trong bộ từ!");
    }

    setAdded((prev) => ({ ...prev, [index]: true }));
  };

  const hskItems = [
    {
      label: "HSK 1",
      onClick: () => {
        setHskLevel(1);
      },
    },
    {
      label: "HSK 2",
      onClick: () => {
        setHskLevel(2);
      },
    },
    {
      label: "HSK 3",
      onClick: () => {
        setHskLevel(3);
      },
    },
    {
      label: "HSK 4",
      onClick: () => {
        setHskLevel(4);
      },
    },
    {
      label: "HSK 5",
      onClick: () => {
        setHskLevel(5);
      },
    },
    {
      label: "HSK 6",
      onClick: () => {
        setHskLevel(6);
      },
    },
  ];

  return (
    <div
      id="RandomWords"
      className="bg-white px-4 md:px-8 py-4 max-w-3xl min-h-96 mx-auto mb-8 rounded-4xl border-4 border-green-one"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Chọn từ ngẫu nhiên</h2>
        <div className="flex items-center gap-4">
          <Dropdown label={`HSK ${hskLevel}`} items={hskItems} />

          <button
            onClick={handleAddNewWord}
            disabled={loading}
            className="hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <img className="flip-x" src="wand.png" width={32} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <img id="confused_loading" src="confused_loading.gif" width={200} />
        </div>
      )}

      {words.length > 0 && !loading && (
        <div className="flex gap-4 w-full flex-wrap justify-around">
          {words.map((item, index) => (
            <div
              key={index}
              className="flex w-full max-w-72 rounded-lg p-4 bg-orange-light"
            >
              <div className="flex flex-col w-full">
                <Speech
                  className="hover:scale-105 cursor-pointer"
                  onClick={() => speakWord(item.word)}
                />
                <p className="text-2xl font-bold text-gray-900">{item.word}</p>
                <p className="text-gray-600 italic">{item.pinyin}</p>
                <p className="text-gray-800">{item.meanings[0]}</p>
              </div>
              <button
                onClick={() => handleAddToMyWords(item, index)}
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
          ))}
        </div>
      )}

      {words.length === 0 && !loading && (
        <div>
          <p className="text-neutral-500 italic">
            Hãy để hệ thống chọn từ ngẫu nhiên cho bạn nào! 🎲
          </p>
        </div>
      )}

      <div id="RandomWordsFooter">
        <div className="goose-1">
          <img src="goose-1.png" />
        </div>

        <div className="goose-2">
          <img className="hat" src="hat.png" />
          <img src="goose-2.png" />
        </div>
      </div>
    </div>
  );
};

export default RandomWords;
