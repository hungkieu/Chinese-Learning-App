import { useState } from "react";
import { Camera, X } from "lucide-react";
import { openaiClient } from "@/lib/openAIClient";
import { ocrPrompt, wordSearchPrompt } from "./prompts";
import { JSON_INSTRUCTION } from "@/consts";
import RandomWords from "./RandomWords";
import Result from "./Result";

const WordSearch = () => {
  const [query, setQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    previewImage(file);
  };

  const handlePasteImage = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          previewImage(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const previewImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      setQuery("");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      if (imageFile) {
        await processImageFile(imageFile);
      } else {
        await processTextQuery();
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const processTextQuery = async () => {
    if (!query.trim()) {
      setError("Vui lòng nhập từ cần tra cứu hoặc dán ảnh.");
      return;
    }
    const prompt = wordSearchPrompt(query);
    const resp = await openaiClient.responses.create({
      model: "gpt-4o-mini",
      instructions: JSON_INSTRUCTION,
      input: prompt,
      temperature: 0.2,
    });
    const text = resp.output_text ?? resp.output?.[0]?.content?.[0]?.text ?? "";
    try {
      const jsonData = JSON.parse(text);
      setResult(jsonData);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      setError("AI trả về dữ liệu không hợp lệ, vui lòng thử lại.");
    }
  };

  const processImageFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const prompt = ocrPrompt();
        try {
          const resp = await openaiClient.responses.create({
            model: "gpt-4o-mini",
            instructions: JSON_INSTRUCTION,
            input: [
              {
                role: "user",
                content: [
                  { type: "input_text", text: prompt },
                  { type: "input_image", image_url: base64Image },
                ],
              },
            ],
            temperature: 0.2,
          });
          const text =
            resp.output_text ?? resp.output?.[0]?.content?.[0]?.text ?? "";
          try {
            const jsonData = JSON.parse(text);
            setResult(Array.isArray(jsonData) ? jsonData : [jsonData]);
            resolve();
          } catch (err) {
            console.error("JSON Parse Error:", text);
            setError("AI trả về dữ liệu không hợp lệ, vui lòng thử lại.");
            reject(err);
          }
        } catch (err) {
          console.error(err);
          setError("Không thể nhận diện từ từ ảnh, vui lòng thử lại.");
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex flex-col gap-2 px-2" onPaste={handlePasteImage}>
          <h3 className="text-xl text-left font-bold text-green-950">
            TÌM KIẾM
          </h3>
          <div className="flex gap-4 bg-white border-2 border-green-gray rounded-3xl max-w-2xl px-4">
            {imagePreview ? (
              <div className="relative flex-1 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-24 object-contain"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Nhập từ hoặc dán ảnh trực tiếp..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1  px-3 py-4 focus:outline-none"
              />
            )}
            <label className="flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer transition-all">
              <img src="/camera.png" height={40} width={40} />
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              <img src="/moon.png" height={40} width={40} />
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {loading && (
            <div className="flex justify-center">
              <img
                id="running-gif"
                className="flip-x"
                src="running.gif"
                width={200}
              />
            </div>
          )}
          {result && <Result result={result} />}
        </div>
      </div>

      <RandomWords />
    </>
  );
};

export default WordSearch;
