import { useMemo, useState, useEffect, useRef } from "react";
import { useMyWordsStore } from "../store/useMyWordsStore";
import hsk from "../json/full_hsk.json";
import speakWords from "../utils/speakWord";
import Modal from "@/components/common/Modal";
import { Bot } from "lucide-react";
import { openaiClient } from "@/lib/openAIClient";
import { wordSearchPrompt } from "@/components/WordSearch/prompts";
import { JSON_INSTRUCTION } from "@/consts";

function segmentSentence(sentence, combinedDict) {
  const tokens = [];
  let i = 0;
  while (i < sentence.length) {
    let found = false;
    for (let len = 5; len > 0; len--) {
      const word = sentence.substr(i, len);
      const entry = combinedDict.find(
        (item) => item.chinese === word || item.word === word
      );
      if (entry) {
        tokens.push({
          chinese: word,
          pinyin: entry.pinyin,
          vietnamese: entry.vietnamese || entry.meaning || "",
        });
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      tokens.push({ chinese: sentence[i], pinyin: "", vietnamese: "" });
      i++;
    }
  }
  return tokens;
}

const PUNCTUATIONS = [
  "，",
  "。",
  "！",
  "？",
  "；",
  "：",
  "…",
  " ",
  ",",
  ".",
  "!",
  "?",
  ";",
  "：",
  "“",
  "”",
  "（",
  "）",
  "(",
  ")",
];

export default function ChineseSentence({ sentence }) {
  const { words, highlightWords, setHighlightWords, addWord } =
    useMyWordsStore();

  const combinedDict = useMemo(() => {
    return [
      ...hsk,
      ...words.map((w) => ({
        chinese: w.word,
        pinyin: w.pinyin,
        vietnamese: w.meanings?.join(", ") ?? "",
      })),
    ];
  }, [words]);

  const tokens = useMemo(
    () => segmentSentence(sentence, combinedDict),
    [sentence, combinedDict]
  );

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    word: null,
    pinyin: "",
    vietnamese: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [tempWord, setTempWord] = useState({
    word: "",
    pinyin: "",
    meanings: "",
    loadingAI: false,
  });

  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e, token) => {
    if (!token.chinese || PUNCTUATIONS.includes(token.chinese)) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      word: token.chinese,
      pinyin: token.pinyin,
      vietnamese: token.vietnamese,
    });
  };

  const handleCopy = async () => {
    if (contextMenu.word) {
      await navigator.clipboard.writeText(contextMenu.word);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleAddWord = () => {
    if (!contextMenu.word) return;

    const hasInfo =
      contextMenu.pinyin?.trim() && contextMenu.vietnamese?.trim();

    if (!hasInfo) {
      setTempWord({
        word: contextMenu.word,
        pinyin: contextMenu.pinyin || "",
        meanings: contextMenu.vietnamese || "",
      });
      setShowAddModal(true);
      setContextMenu((prev) => ({ ...prev, visible: false }));
      return;
    }

    addWord({
      word: contextMenu.word,
      pinyin: contextMenu.pinyin || "",
      meanings: contextMenu.vietnamese
        ? contextMenu.vietnamese.split(",").map((s) => s.trim())
        : [],
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const confirmAddWord = () => {
    const meaningsArray = tempWord.meanings
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    addWord({
      word: tempWord.word,
      pinyin: tempWord.pinyin.trim(),
      meanings: meaningsArray,
    });

    setShowAddModal(false);
  };

  const isHighlighted = (word) =>
    highlightWords.some((w) => w.word === word || w === word);

  const isInWordStore = (word) =>
    words.some((w) => w.word.trim() === word.trim());

  const toggleHighlight = () => {
    const word = contextMenu.word;
    if (!word) return;
    let updated;
    if (isHighlighted(word)) {
      updated = highlightWords.filter(
        (w) => (typeof w === "string" ? w : w.word) !== word
      );
    } else {
      updated = [...highlightWords, { word }];
    }
    setHighlightWords(updated);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative flex flex-wrap">
      {tokens.map((token, index) => {
        const isPunctuation =
          !token.chinese || PUNCTUATIONS.includes(token.chinese);
        const highlighted = isHighlighted(token.chinese);

        return (
          <span
            key={index}
            onContextMenu={(e) => handleContextMenu(e, token)}
            className={`relative group cursor-pointer px-1 py-0.5 rounded transition ${
              isPunctuation
                ? ""
                : highlighted
                ? "font-bold bg-yellow-200 text-yellow-950"
                : token.vietnamese
                ? "hover:bg-yellow-100"
                : ""
            }`}
            title={
              !isPunctuation && !token.vietnamese
                ? "Từ này chưa có chú giải trong từ điển."
                : ""
            }
          >
            {token.chinese}
            {!isPunctuation && token.vietnamese && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:inline-block bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                <div>{token.pinyin}</div>
                <div className="font-bold">{token.vietnamese}</div>
              </span>
            )}
          </span>
        );
      })}

      {contextMenu.visible && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-56"
        >
          <ul className="divide-y divide-gray-200">
            <li
              onClick={handleCopy}
              className="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              📋 Copy "{contextMenu.word}"
            </li>
            <li
              onClick={() => speakWords(contextMenu.word)}
              className="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              🎤 Speak "{contextMenu.word}"
            </li>
            <li
              onClick={toggleHighlight}
              className="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              {isHighlighted(contextMenu.word)
                ? "❌ Bỏ highlight"
                : "🌟 Highlight"}
            </li>
            {!isInWordStore(contextMenu.word) && (
              <li
                onClick={handleAddWord}
                className="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-green-700 font-medium"
              >
                ➕ Thêm vào bộ từ
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ✅ Modal thêm từ nếu thiếu thông tin */}
      <Modal
        isOpen={showAddModal}
        setOpen={setShowAddModal}
        title="Thêm từ mới"
        okText="Lưu"
        cancelText="Hủy"
        onOk={confirmAddWord}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-green-950 font-medium">Chinese</label>
            <input
              type="text"
              value={tempWord.word}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 text-green-950 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="block text-green-950 font-medium mb-0">
              Pinyin
            </label>
            <button
              type="button"
              onClick={async () => {
                if (!tempWord.word) return;
                try {
                  setTempWord((prev) => ({ ...prev, loadingAI: true }));
                  const prompt = wordSearchPrompt(tempWord.word);
                  const resp = await openaiClient.responses.create({
                    model: "gpt-4o-mini",
                    instructions: JSON_INSTRUCTION,
                    input: prompt,
                    temperature: 0.2,
                  });
                  const text =
                    resp.output_text ??
                    resp.output?.[0]?.content?.[0]?.text ??
                    "";
                  const jsonData = JSON.parse(text);
                  setTempWord((prev) => ({
                    ...prev,
                    pinyin: jsonData.pinyin || prev.pinyin,
                    meanings: jsonData.vietnamese || prev.meanings,
                    loadingAI: false,
                  }));
                } catch (err) {
                  console.error(err);
                  alert("Không thể lấy thông tin từ AI, vui lòng thử lại.");
                  setTempWord((prev) => ({ ...prev, loadingAI: false }));
                }
              }}
              disabled={!!tempWord.loadingAI}
              className="flex items-center gap-1 text-green-one hover:text-green-700 border border-green-one px-2 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Bot size={16} />
              {tempWord.loadingAI ? "Đang gọi AI..." : "AI điền giúp"}
            </button>
          </div>

          <input
            type="text"
            value={tempWord.pinyin}
            onChange={(e) =>
              setTempWord((prev) => ({ ...prev, pinyin: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập Pinyin..."
          />

          <div>
            <label className="block text-green-950 font-medium">Nghĩa</label>
            <input
              type="text"
              value={tempWord.meanings}
              onChange={(e) =>
                setTempWord((prev) => ({ ...prev, meanings: e.target.value }))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="Nhập nghĩa, cách nhau bằng dấu phẩy (,)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
