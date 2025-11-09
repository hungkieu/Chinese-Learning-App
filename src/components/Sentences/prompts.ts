type PromptOptions = {
  hskLevel: number | null;
  userInput: string;
  dailyWords: Word[];
};

export const buildPrompt = ({dailyWords, userInput, hskLevel}: PromptOptions) => {
  const parts: string[] = [];
  
  if (dailyWords.length > 0) {
    parts.push(
      `Hãy viết đoạn văn có sử dụng các từ sau: ${dailyWords
        .map((w) => w.word)
        .join(", ")}.`
    );
  }

  if (userInput.trim()) {
    parts.push(`Kết hợp nội dung người dùng cung cấp: "${userInput}".`);
  }

  if (hskLevel) {
    parts.push(`Phù hợp với trình độ HSK ${hskLevel}.`);
  }

  if (parts.length === 0) {
    parts.push("Hãy viết đoạn văn ngẫu nhiên.");
  }

  return `
        Bạn là giáo viên tiếng Trung chuyên tạo bài học sinh động cho người học Việt Nam.
  
        Hãy tạo **một đoạn văn tiếng Trung tự nhiên, mạch lạc và có cảm xúc** (không chỉ ghép từ),
        sau đó trả về **duy nhất JSON** theo cấu trúc:
  
        {
          "sentences": ["câu 1", "câu 2", "câu 3", "câu 4", "câu 5"...],
          "meaning": "dịch toàn bộ đoạn văn sang tiếng Việt, tự nhiên, dễ hiểu",
          "questions": [
            {
              "question": "câu hỏi hiểu nội dung bằng tiếng Trung",
              "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"],
              "answer": "ký tự A/B/C/D là đúng"
            },
            {
              "question": "câu hỏi khác giúp người học suy luận từ nội dung",
              "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"],
              "answer": "ký tự A/B/C/D là đúng"
            }
          ]
        }
  
        Hướng dẫn viết đoạn văn:
        - Dài **75–150 từ**, có **ngữ cảnh rõ ràng** (ví dụ: cuộc trò chuyện, một ngày, một câu chuyện ngắn...).
        - **Tự nhiên, dễ đọc, phù hợp với người học trình độ HSK ${
          hskLevel || "2–5"
        }**.
        - Nếu có danh sách từ, hãy dùng chúng **một cách mượt mà, không gượng ép**, gắn liền trong một chủ đề cụ thể.
        - Nếu người dùng có yêu cầu riêng, hãy **đặt đoạn văn trong bối cảnh đó**.
        - **Không liệt kê từ vựng** hay dịch từng câu — chỉ cần đoạn văn mạch lạc.
        - Không thêm văn bản ngoài JSON.
  
        ${parts.join("\n")}
  
        Ví dụ cách viết tốt:
        “今天早上，李华去市场买水果。他看到很多苹果和香蕉，但因为天气很热，他决定先去喝杯冷饮。”
  
        → Cách viết như vậy tự nhiên, có hành động, cảm xúc và ngữ cảnh.
        `;
}
