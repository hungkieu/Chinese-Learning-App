// tts.ts
import { openaiClient } from "./openAIClient";

type TTSOptions = {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  model?: "tts-1" | "tts-1-hd" | "gpt-4o-mini-tts";
  format?: "mp3" | "opus" | "aac" | "wav";
  autoplay?: boolean;        // ✅ mới: mặc định false
  signal?: AbortSignal;      // ✅ mới: cho phép huỷ
};

export async function speak({
  text,
  voice = "alloy",
  model = "tts-1",
  format = "mp3",
  autoplay = false,
  signal,
}: TTSOptions) {
  const resp = await openaiClient.audio.speech.create(
    { model, voice, input: text }, // ✅ truyền format cho server
    { signal }                             // ✅ hỗ trợ AbortController
  );

  const arrayBuf = await resp.arrayBuffer();
  const mime =
    format === "wav"
      ? "audio/wav"
      : format === "aac"
      ? "audio/aac"
      : format === "opus"
      ? "audio/ogg; codecs=opus"
      : "audio/mpeg";
  const blob = new Blob([arrayBuf], { type: mime });
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  if (autoplay) {
    try {
      await audio.play();
    } catch {
      // có thể bị chặn autoplay — bỏ qua
    }
  }

  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `openai-tts.${format}`;
    a.click();
  };
  const stop = () => audio.pause();

  return { url, audio, download, stop };
}
