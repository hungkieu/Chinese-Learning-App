interface Props {
  onExit: () => void;
  stats: {
    correctCount: number;
    wrongCount: number;
    dontKnowCount: number;
    perWord: {
      [id: string]: {
        word?: string;
        correct: number;
        wrong: number;
        dontknow: number;
      };
    };
  };
}

export const FinishTest = ({ stats, onExit }: Props) => {
  const total =
    stats.correctCount + stats.wrongCount + stats.dontKnowCount || 1;
  const correctRate = ((stats.correctCount / total) * 100).toFixed(0);
  const wrongRate = ((stats.wrongCount / total) * 100).toFixed(0);
  const dontRate = ((stats.dontKnowCount / total) * 100).toFixed(0);

  const wordEntries = Object.entries(stats.perWord);

  return (
    <div className="bg-white rounded-3xl px-6 pt-6 pb-10 w-full max-w-3xl mx-auto shadow-md">
      <div className="text-center mb-6">
        <img
          src="/score.gif"
          alt="Score"
          className="inline-block w-full max-w-xs mb-4"
        />
        <p className="text-lime-600 text-2xl font-bold mb-1">
          🎉 Bạn đã hoàn thành bài kiểm tra!
        </p>
        <p className="text-gray-600 mb-6">
          Hãy quay lại và ôn tập thường xuyên nhé.
        </p>
      </div>

      <div className="overflow-x-auto mb-10">
        <table className="min-w-full border border-lime-200 rounded-xl">
          <thead className="bg-lime-50 text-lime-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold border-b border-lime-200">
                Loại thống kê
              </th>
              <th className="px-4 py-3 text-center font-semibold border-b border-lime-200">
                Số lần
              </th>
              <th className="px-4 py-3 text-center font-semibold border-b border-lime-200">
                Tỷ lệ
              </th>
            </tr>
          </thead>
          <tbody className="text-green-950">
            <tr className="hover:bg-lime-50 transition-colors">
              <td className="px-4 py-3 font-medium text-lime-700">
                ✅ Trả lời đúng
              </td>
              <td className="px-4 py-3 text-center font-bold text-lime-600">
                {stats.correctCount}
              </td>
              <td className="px-4 py-3 text-center text-lime-500 font-semibold">
                {correctRate}%
              </td>
            </tr>
            <tr className="hover:bg-red-50 transition-colors">
              <td className="px-4 py-3 font-medium text-red-600">
                ❌ Trả lời sai
              </td>
              <td className="px-4 py-3 text-center font-bold text-red-600">
                {stats.wrongCount}
              </td>
              <td className="px-4 py-3 text-center text-red-500 font-semibold">
                {wrongRate}%
              </td>
            </tr>
            <tr className="hover:bg-yellow-50 transition-colors">
              <td className="px-4 py-3 font-medium text-yellow-700">
                🤔 Bấm “Xem”
              </td>
              <td className="px-4 py-3 text-center font-bold text-yellow-600">
                {stats.dontKnowCount}
              </td>
              <td className="px-4 py-3 text-center text-yellow-500 font-semibold">
                {dontRate}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto mb-8">
        <h3 className="text-lime-700 font-semibold mb-3 text-lg">
          📘 Thống kê chi tiết từng từ
        </h3>
        <table className="min-w-full border border-lime-200 rounded-xl text-green-950">
          <thead className="bg-lime-50 text-lime-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold border-b border-lime-200">
                Từ
              </th>
              <th className="px-4 py-3 text-center font-semibold border-b border-lime-200">
                ✅ Đúng trong 1 lần
              </th>
              <th className="px-4 py-3 text-center font-semibold border-b border-lime-200">
                ❌ Trả lời sai
              </th>
              <th className="px-4 py-3 text-center font-semibold border-b border-lime-200">
                🤔 Bấm “Xem”
              </th>
            </tr>
          </thead>
          <tbody>
            {wordEntries.length > 0 ? (
              wordEntries.map(([id, data]) => (
                <tr
                  key={id}
                  className="hover:bg-lime-50 border-b border-lime-100 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-green-800 text-left">
                    {data.word || "-"}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-lime-600">
                    {data.wrong == 0 && data.dontknow == 0 ? "✅" : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600 font-medium">
                    {data.wrong > 0 ? `${data.wrong} lần` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-600 font-medium">
                    {data.dontknow > 0 ? `${data.dontknow} lần` : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-gray-500 italic"
                >
                  Không có dữ liệu thống kê chi tiết.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onExit}
          className="bg-lime-600 hover:bg-lime-700 active:scale-95 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default FinishTest;
