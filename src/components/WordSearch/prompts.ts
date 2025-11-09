export const wordSearchPrompt =  (query: string) => `
  Bạn là trợ lý tiếng Trung, hãy phân tích từ hoặc cụm từ sau: "${query}".
  
  Trả về kết quả **dạng JSON** với đúng cấu trúc:
  {
    "chinese": "<từ hoặc cụm từ tiếng Trung>",
    "pinyin": "<pinyin>",
    "vietnamese": "<nghĩa tiếng Việt dễ hiểu>"
  }

  Yêu cầu:
  - Nếu là cụm từ, giữ nguyên cả cụm từ.
`;

export const ocrPrompt = () => `
  Bạn là trợ lý tiếng Trung. Hãy phân tích nội dung ảnh để nhận diện chữ tiếng Trung.

  Trả về **danh sách JSON**:
  [
    {
      "chinese": "爱",
      "pinyin": "ài",
      "vietnamese": "yêu"
    },
    {
      "chinese": "学习",
      "pinyin": "xuéxí",
      "vietnamese": "học tập"
    }
  ]

  Quy tắc:
  - Nếu từ đã có pinyin và nghĩa thì giữ nguyên.
  - Nếu chưa có, tự tra và bổ sung.
`
