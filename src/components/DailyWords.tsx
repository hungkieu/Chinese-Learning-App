import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useDailyWords, useSetDailyWords } from "@/store/useMyWordsStore";

const DailyWords = () => {
  const dailyWords = useDailyWords();
  const setDailyWords = useSetDailyWords();

  const handleRemove = (wordToRemove: string) => {
    const updated = dailyWords.filter((w) => w.word !== wordToRemove);
    setDailyWords(updated);
  };

  return (
    <AnimatePresence initial={false}>
      {dailyWords && dailyWords.length > 0 && (
        <motion.div
          key="daily-words"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-4 rounded-xl mx-auto mb-8"
          >
            <h2 className="text-lg text-green-950 text-left font-bold mb-2">
              Từ đã chọn:
            </h2>

            <div className="flex flex-wrap gap-2 justify-start">
              {dailyWords.map((item) => (
                <div
                  onClick={() => handleRemove(item.word)}
                  key={item.word}
                  className="flex items-center gap-1 text-white rounded-full px-3 py-1 text-sm font-medium bg-green-gray hover:bg-violet-300 transition-colors"
                >
                  <span>{item.word}</span>
                  <button
                    className="focus:outline-none"
                    title="Xoá khỏi danh sách"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyWords;
