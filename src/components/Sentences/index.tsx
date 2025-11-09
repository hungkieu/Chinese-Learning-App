import { useState } from "react";
import { useReadingLibraryStore } from "@/store/useReadingLibraryStore";
import ReadingGenerator from "./ReadingGenerator";
import { Plus, Eye, Trash } from "lucide-react";
import { useReadingStore } from "@/store/useReadingStore";

const Sentences = () => {
  const readings = useReadingLibraryStore((s) => s.readings);
  const removeReading = useReadingLibraryStore((s) => s.removeReading);
  const getReadingById = useReadingLibraryStore((s) => s.getReadingById);
  const setCurrentReadingId = useReadingLibraryStore(
    (s) => s.setCurrentReadingId
  );

  const setResult = useReadingStore((s) => s.setResult);
  const setTtsLoading = useReadingStore((s) => s.setTtsLoading);
  const clearReading = useReadingStore((s) => s.clear);

  const [showGenerator, setShowGenerator] = useState(readings.length === 0);

  const handleViewReading = (id: string) => {
    const data = getReadingById(id);
    if (data) {
      clearReading();
      setTtsLoading(true);
      setResult({
        sentences: data.sentences,
        meaning: data.meaning,
        questions: data.questions,
      });
      setCurrentReadingId(id);
      setShowGenerator(true);
    }
  };

  const handleDeleteReading = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bài đọc này?")) removeReading(id);
  };

  if (showGenerator) {
    return (
      <div
        id="Sentences"
        className="bg-white px-4 md:px-8 py-4 max-w-3xl min-h-96 mx-auto mb-8 rounded-4xl border-4 border-green-one"
      >
        <ReadingGenerator
          onBack={() => {
            setCurrentReadingId(null);
            setShowGenerator(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="Sentences"
      className="bg-white px-4 md:px-8 py-4 max-w-5xl min-h-96 mx-auto mb-8 rounded-4xl border-4 border-green-one"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-one">Quản lý bài đọc</h2>
        <button
          onClick={() => {
            setCurrentReadingId(null);
            clearReading();
            setShowGenerator(true);
          }}
          className="flex items-center gap-2 bg-green-one text-white px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all font-semibold"
        >
          <Plus size={18} /> Tạo bài đọc mới
        </button>
      </div>

      {readings.length === 0 ? (
        <p className="text-gray-500 text-center italic">Chưa có bài đọc nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {readings.map((r) => (
            <div
              key={r.id}
              className="relative border-2 border-green-gray rounded-2xl p-4 bg-orange-light hover:shadow-lg transition-all"
            >
              <button
                onClick={() => handleViewReading(r.id)}
                className="absolute top-2 right-12 bg-green-one text-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                title="Xem bài đọc"
              >
                <Eye size={18} />
              </button>

              <button
                onClick={() => handleDeleteReading(r.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                title="Xóa bài đọc"
              >
                <Trash size={18} />
              </button>

              <h3 className="text-green-950 font-bold text-lg mb-1 truncate">
                {r.title || "Bài đọc không tên"}
              </h3>
              <p className="text-gray-700 text-sm line-clamp-3 mb-2">
                {r.sentences.join(" ")}
              </p>
              <p className="text-green-one text-xs italic line-clamp-2">
                {r.meaning}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sentences;
