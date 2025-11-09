export const speakWord = (word: string) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "zh-CN";
  speechSynthesis.speak(utterance);
};

export const getRandom = (arr: string[]) =>
  arr[Math.floor(Math.random() * Math.max(1, arr.length))] ?? "";

export const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, delay);
  };
}
