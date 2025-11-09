import { useUIStore } from "@/store/useUIStore";
import { useWordById, useUpdateWord } from "@/store/useMyWordsStore";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const WordEdit = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const updateWord = useUpdateWord();

  const wordId = useMemo(() => {
    if (activeTab.startsWith("words/")) {
      return activeTab.split("/")[1];
    }
    return null;
  }, [activeTab]);

  const word = useWordById(wordId || "");
  const [newMeaning, setNewMeaning] = useState("");

  if (!word) {
    return <p className="text-center text-gray-500">Không tìm thấy từ</p>;
  }

  const handleChangePinyin = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWord(word.id, { pinyin: e.target.value });
  };

  const handleAddMeaning = () => {
    const trimmed = newMeaning.trim();
    if (!trimmed) return;

    const updatedMeanings = [...word.meanings, trimmed];
    updateWord(word.id, { meanings: updatedMeanings });
    setNewMeaning("");
  };

  // Xóa nghĩa tại index
  const handleRemoveMeaning = (index: number) => {
    if (word.meanings.length === 1) return; // Không xóa nếu chỉ còn 1
    const updatedMeanings = word.meanings.filter((_, i) => i !== index);
    updateWord(word.id, { meanings: updatedMeanings });
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Chỉnh sửa từ</h2>

      {/* Chinese field (readonly) */}
      <div className="mb-4">
        <label className="block font-medium text-green-950">Chinese</label>
        <input
          type="text"
          value={word.word}
          readOnly
          className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 text-green-950 cursor-not-allowed"
        />
      </div>

      {/* Pinyin field */}
      <div className="mb-4">
        <label className="block font-medium text-green-950">Pinyin</label>
        <input
          type="text"
          value={word.pinyin}
          onChange={handleChangePinyin}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-green-950 mb-2">
          Danh sách nghĩa
        </label>
        {word.meanings.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Chưa có nghĩa nào</p>
        ) : (
          <ul className="space-y-2">
            {word.meanings.map((meaning, index) => {
              const isOnlyOneMeaning = word.meanings.length === 1;
              return (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 border rounded px-3 py-2"
                >
                  <span className="text-gray-800">{meaning}</span>
                  <button
                    onClick={() => handleRemoveMeaning(index)}
                    disabled={isOnlyOneMeaning}
                    className={`transition-colors ${
                      isOnlyOneMeaning
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500 hover:text-red-700"
                    }`}
                    title={
                      isOnlyOneMeaning
                        ? "Phải có ít nhất 1 nghĩa, không thể xóa"
                        : "Xóa nghĩa này"
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <label className="block font-medium text-green-950 mb-1">
          Thêm nghĩa mới
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            placeholder="Nhập nghĩa mới"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleAddMeaning}
            disabled={!newMeaning.trim()}
            className={`px-3 py-2 rounded flex items-center gap-1 transition-all ${
              newMeaning.trim()
                ? "bg-green-one text-white hover:scale-110 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus size={16} />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordEdit;
