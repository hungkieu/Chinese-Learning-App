import { useState } from "react";
import { updateCardSM2 } from "../utils/supermemo";
import speakWord from "../utils/speakWord";
import { useMyWordsStore } from "../store/useMyWordsStore";
import { Speech } from "lucide-react";

const Vocabulary = () => {
  const { myWords, getDueWords, addWord } = useMyWordsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState(""); // Lưu nghĩa người dùng nhập
  const [isCorrect, setIsCorrect] = useState(null); // Trạng thái đúng/sai

  const dueCards = getDueWords();

  const [cards, setCards] = useState(
    dueCards.map((item) => ({
      ...item,
      ef: item.ef || 2.5,
      interval: item.interval || 0,
      repetition: item.repetition || 0,
      dueDate: item.dueDate || null,
    }))
  );

  const currentCard = cards[currentIndex];

  const handleReview = (quality) => {
    const updatedCard = updateCardSM2(currentCard, quality);

    const newCards = [...cards];
    newCards[currentIndex] = updatedCard;
    setCards(newCards);

    addWord(updatedCard); // cập nhật vào store + localStorage

    setShowAnswer(false);
    setUserAnswer("");
    setIsCorrect(null);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(cards.length); // trạng thái hoàn thành
    }
  };

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) return;

    // So sánh nghĩa người nhập với nghĩa chuẩn, không phân biệt hoa thường, bỏ khoảng trắng
    const normalizedInput = userAnswer.trim().toLowerCase();
    const normalizedCorrect = currentCard.meaning.trim().toLowerCase();

    if (normalizedInput === normalizedCorrect) {
      setIsCorrect(true);
      setShowAnswer(true);
    } else {
      setIsCorrect(false);
      setShowAnswer(true);
    }
  };

  if (myWords.length === 0) {
    return (
      <div className="flex flex-col items-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Từ vựng hôm nay
          </h2>
          <p className="text-gray-700">
            Bạn chưa có từ vựng nào trong danh sách. Hãy thêm từ mới để bắt đầu
            ôn tập!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Từ vựng hôm nay ({Math.min(currentIndex + 1, cards.length)}/
            {cards.length})
          </h2>
        </div>

        {currentIndex >= cards.length ? (
          <div className="p-6 text-center">
            <div>
              <img
                src="/score.gif"
                alt="Score"
                className="inline-block w-full"
              />
            </div>
            <p className="text-green-600 text-xl font-bold mb-2">
              🎉 Bạn đã hoàn thành phiên ôn tập hôm nay!
            </p>
            <p className="text-gray-600">
              Hãy quay lại vào ngày mai để ôn tiếp nhé.
            </p>
          </div>
        ) : currentCard ? (
          <>
            <p className="text-6xl font-bold mb-4 text-red-500">
              {currentCard.word}
            </p>

            {/* Ô nhập nghĩa người dùng */}
            {!showAnswer && (
              <div className="flex flex-col items-center mb-4">
                <input
                  type="text"
                  placeholder="Nhập nghĩa tiếng Việt..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleReview(0)}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Không biết
                  </button>
                  <button
                    onClick={handleCheckAnswer}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>
            )}

            {showAnswer && (
              <>
                <p className="flex items-center justify-center gap-2 text-blue-600 italic mb-2">
                  {currentCard.pinyin}
                  <Speech
                    className="hover:text-blue-900 cursor-pointer"
                    onClick={() => speakWord(currentCard.word)}
                  />
                </p>
                <p className="text-gray-700 mb-6">{currentCard.meaning}</p>

                {/* Kết quả đúng/sai */}
                {isCorrect !== null && (
                  <p
                    className={`text-lg font-bold mb-4 ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect ? "Chính xác! 🎉" : "Sai rồi 😢"}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleReview(0)}
                    className="py-1 px-2 text-sm rounded-lg text-white font-bold bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Khó
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    className="py-1 px-2 text-sm rounded-lg text-white font-bold bg-yellow-500 hover:bg-yellow-600 transition-colors"
                  >
                    Bình thường
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    className="py-1 px-2 text-sm rounded-lg text-white font-bold bg-green-500 hover:bg-green-600 transition-colors"
                  >
                    Dễ
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500">Không có thẻ nào để ôn tập.</p>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;
