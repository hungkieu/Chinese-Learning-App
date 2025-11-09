import { Trophy } from "lucide-react";

type QuizProps = {
  currentQuiz: Quiz | null;
  quizScore: number;
  selectedAnswer: string | null;
  showAnswer: boolean;
  setSelectedAnswer: (answer: string) => void;
  handleQuizAnswer: () => void;
};

const Quiz = (props: QuizProps) => {
  const {
    currentQuiz,
    quizScore,
    selectedAnswer,
    showAnswer,
    setSelectedAnswer,
    handleQuizAnswer,
  } = props;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quiz tiếng Trung</h2>
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
          <Trophy size={20} className="text-yellow-600" />
          <span className="font-bold text-yellow-700">Điểm: {quizScore}</span>
        </div>
      </div>

      {currentQuiz && (
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {currentQuiz.question}
            </div>
            {currentQuiz.pinyin && (
              <div className="text-lg text-blue-600">{currentQuiz.pinyin}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                disabled={showAnswer}
                className={`p-4 rounded-lg border-2 transition-all duration-200 font-medium ${
                  selectedAnswer === option
                    ? showAnswer
                      ? option === currentQuiz.correct
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-red-500 bg-red-50 text-red-600"
                    : showAnswer && option === currentQuiz.correct
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && !showAnswer && (
            <button
              onClick={handleQuizAnswer}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Kiểm tra
            </button>
          )}

          {showAnswer && (
            <div className="mt-4">
              <div
                className={`text-lg font-bold ${
                  selectedAnswer === currentQuiz.correct
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedAnswer === currentQuiz.correct
                  ? "🎉 Chính xác!"
                  : "❌ Sai rồi!"}
              </div>
              {selectedAnswer !== currentQuiz.correct && (
                <div className="text-gray-600 mt-2">
                  Đáp án đúng:{" "}
                  <span className="font-bold text-green-600">
                    {currentQuiz.correct}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
