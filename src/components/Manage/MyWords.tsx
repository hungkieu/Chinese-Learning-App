import { useEffect, useState } from "react";
import { Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useWords,
  useRemoveWord,
  useDailyWords,
  useSetDailyWords,
} from "@/store/useMyWordsStore";
import { useUIStore } from "@/store/useUIStore";
import TestSession from "@/components/TestSession";
import Button from "@/components/common/Button";
import Dropdown from "@/components/common/Dropdown";
import Checkbox from "../common/Checkbox";

const MyWords = () => {
  const myWords = useWords();
  const removeWord = useRemoveWord();
  const dailyWords = useDailyWords();
  const setDailyWords = useSetDailyWords();
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const [isTesting, setIsTesting] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<
    "none" | "asc" | "desc" | "lastReviewedAsc" | "lastReviewedDesc"
  >("none");
  const itemsPerPage = 10;

  const sortedWords =
    sortOrder === "desc"
      ? [...myWords].sort((a, b) => {
          const ra = a.testCount > 0 ? a.accuracy.correct / a.testCount : -1;
          const rb = b.testCount > 0 ? b.accuracy.correct / b.testCount : -1;
          return ra - rb;
        })
      : sortOrder === "asc"
      ? [...myWords].sort((a, b) => {
          const ra = a.testCount > 0 ? a.accuracy.correct / a.testCount : -1;
          const rb = b.testCount > 0 ? b.accuracy.correct / b.testCount : -1;
          return rb - ra;
        })
      : sortOrder === "lastReviewedAsc"
      ? [...myWords].sort((a, b) => {
          const da = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
          const db = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
          return db - da;
        })
      : sortOrder === "lastReviewedDesc"
      ? [...myWords].sort((a, b) => {
          const da = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
          const db = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
          return da - db;
        })
      : [...myWords];

  const totalPages = Math.ceil(sortedWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = [...sortedWords].reverse().slice(startIndex, endIndex);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSelectOne = (id: string) => {
    const exists = dailyWords.some((w) => w.id === id);
    let updated;
    if (exists) {
      updated = dailyWords.filter((w) => w.id !== id);
    } else {
      const word = myWords.find((w) => w.id === id);
      updated = word ? [...dailyWords, word] : dailyWords;
    }
    setDailyWords(updated);
  };

  const toggleSelectAllInPage = () => {
    const currentPageIds = currentWords.map((word) => word.id);
    const allSelected = currentPageIds.every((id) =>
      dailyWords.some((w) => w.id === id)
    );

    let updated;
    if (allSelected) {
      updated = dailyWords.filter((w) => !currentPageIds.includes(w.id));
    } else {
      const newOnes = currentWords.filter(
        (w) => !dailyWords.some((dw) => dw.id === w.id)
      );
      updated = [...dailyWords, ...newOnes];
    }

    setDailyWords(updated);
  };

  const toggleSelectAllGlobal = () => {
    const allIds = myWords.map((w) => w.id);
    const allSelected = allIds.every((id) =>
      dailyWords.some((w) => w.id === id)
    );
    let updated: Word[];
    if (allSelected) {
      updated = [];
    } else {
      updated = [...myWords];
    }
    setDailyWords(updated);
  };

  const selectRandomWords = () => {
    if (myWords.length === 0) return;

    const randomCount = Math.min(10, myWords.length);

    const weightedPool = myWords.map((w) => {
      const ratio = w.testCount > 0 ? w.accuracy.correct / w.testCount : 0.5;
      const weight = 1 - ratio;
      return { word: w, weight: Math.max(weight, 0.05) };
    });

    const totalWeight = weightedPool.reduce((sum, w) => sum + w.weight, 0);

    const pickOne = () => {
      let rand = Math.random() * totalWeight;
      for (const w of weightedPool) {
        rand -= w.weight;
        if (rand <= 0) return w.word;
      }
      return weightedPool[weightedPool.length - 1].word;
    };

    const selected: any[] = [];
    while (selected.length < randomCount && selected.length < myWords.length) {
      const candidate = pickOne();
      if (!selected.some((s) => s.id === candidate.id)) {
        selected.push(candidate);
      }
    }

    setDailyWords(selected);
  };

  const handleStartTest = (isRandom = false, isPracticeMode = false) => {
    if (isRandom) {
      selectRandomWords();
      setTimeout(() => setIsTesting(true), 100);
    } else {
      if (dailyWords.length === 0) {
        alert("Vui lòng chọn ít nhất 1 từ để tạo bài kiểm tra!");
        return;
      }
      setIsPracticeMode(isPracticeMode);
      setIsTesting(true);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isTesting) {
    return (
      <TestSession
        selectedIds={dailyWords.map((w) => w.id)}
        onExit={() => {
          setIsTesting(false);
          setDailyWords([]);
        }}
        practiceMode={isPracticeMode}
      />
    );
  }

  const currentPageIds = currentWords.map((word) => word.id);
  const allInPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => dailyWords.some((w) => w.id === id));

  const testItems = [
    {
      label: "Tạo bài",
      onClick: () => handleStartTest(false),
    },
    { label: "Ngẫu nhiên", onClick: () => handleStartTest(true) },
  ];

  const sortItems = [
    { label: "Tỷ lệ đúng tăng dần", onClick: () => setSortOrder("asc") },
    { label: "Tỷ lệ đúng giảm dần", onClick: () => setSortOrder("desc") },
    { label: "Gần đây nhất", onClick: () => setSortOrder("lastReviewedDesc") },
    { label: "Cũ nhất", onClick: () => setSortOrder("lastReviewedAsc") },
    { label: "Mặc định", onClick: () => setSortOrder("none") },
  ];

  const hasWords = myWords.length > 0;

  return (
    <div className="flex flex-col gap-4 relative bg-white rounded-4xl px-2 md:px-6 py-8 w-full max-w-3xl mx-auto mb-8">
      <div className="three-hearts absolute top-18 md:top-36 -left-8 md:-left-13 rotate-270">
        <img
          className="w-16 md:w-25"
          src="/three-hearts.png"
          alt="Three Hearts"
        />
      </div>

      <div className="three-flowers flex flex-col absolute bottom-6 md:bottom-8 -right-2 md:-right-4">
        <img className="w-6 md:w-9" src="/f1.png" alt="Three Flowers" />
        <img className="w-6 md:w-9" src="/f2.png" alt="Three Flowers" />
        <img className="w-6 md:w-9" src="/f3.png" alt="Three Flowers" />
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="text-lg text-green-one">
          Đã chọn:{" "}
          <span className="font-bold" style={{ color: "#ff647a" }}>
            {dailyWords.length}
          </span>{" "}
          từ
        </div>

        <div className="flex gap-4">
          <Button onClick={() => handleStartTest(false, true)}>
            Luyện tập
          </Button>

          <Dropdown label="Kiểm tra" items={testItems} />
        </div>
      </div>

      {hasWords ? (
        <div className="overflow-x-auto px-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <Button onClick={toggleSelectAllGlobal}>
                {dailyWords.length === myWords.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
            </div>
            <div className="flex">
              <Dropdown label="Sắp xếp" items={sortItems} />
            </div>
          </div>

          <table id="TableMyWords" className="min-w-full">
            <thead>
              <tr>
                <th className="w-12 px-2 py-2 text-green-950 text-center border-b">
                  <Checkbox
                    checked={allInPageSelected}
                    onChange={toggleSelectAllInPage}
                  />
                </th>
                <th className="px-4 py-2 text-green-950 text-center border-b">
                  Chinese
                </th>
                <th className="px-4 py-2 text-green-950 text-center border-b">
                  Đúng/Sai
                </th>
                <th className="px-4 py-2 text-green-950 text-center border-b w-4">
                  Sửa
                </th>
                <th className="px-4 py-2 text-green-950 text-center border-b w-4">
                  Xóa
                </th>
              </tr>
            </thead>
            <tbody>
              {currentWords.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-center border-b">
                    <Checkbox
                      checked={dailyWords.some((w) => w.id === item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex flex-col">
                      <span className="font-bold text-green-950">
                        {item.word}
                      </span>
                      <span className="text-green-one italic">
                        {item.pinyin}
                      </span>
                      <span className="text-green-one">
                        {item.meanings.join(", ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    {item.testCount > 0 ? (
                      <div className="relative w-full h-4 bg-red-100 inset-shadow-red-100 rounded-full overflow-hidden ">
                        <div
                          className="absolute left-0 top-0 h-full bg-progress rounded-full"
                          style={{
                            width: `${
                              (item.accuracy.correct / item.testCount) * 100
                            }%`,
                          }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                          {(
                            (item.accuracy.correct / item.testCount) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-4 bg-red-100 rounded-full relative">
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
                          -%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    <button
                      onClick={() => setActiveTab(`words/${item.id}`)}
                      className="text-green-one hover:scale-110 transition-transform"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center border-b">
                    <button
                      onClick={() => removeWord(item.id)}
                      className="text-green-one hover:scale-110 transition-transform"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-green-gray py-20">
          Bạn chưa có từ nào trong danh sách. Vui lòng thêm từ mới!
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white bg-green-gray hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft strokeWidth={2} size={20} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 font-bold rounded-lg ${
                  currentPage === page
                    ? "bg-green-one text-white"
                    : "bg-green-gray text-white hover:scale-110 transition-all"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white bg-green-gray hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight strokeWidth={2} size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyWords;
