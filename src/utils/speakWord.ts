const speakWord = (word: string): void => {
  if (!word) return;

  if (!("speechSynthesis" in window)) {
    alert("Trình duyệt không hỗ trợ tính năng đọc văn bản.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);

  utterance.lang = "zh-CN"; // tiếng Trung (Mandarin)
  utterance.rate = 0.9; // tốc độ đọc (0.1 - 10, mặc định 1)
  utterance.pitch = 1; // cao độ giọng đọc (0 - 2, mặc định 1)

  utterance.onend = () => {
    console.log("Đọc xong:", word);
  };

  window.speechSynthesis.speak(utterance);
}

export default speakWord;
