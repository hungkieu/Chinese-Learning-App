import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Timer,
  Settings2,
  Repeat, // 🔹 thêm icon loop
} from "lucide-react";

type Props = {
  src: string;
  title?: string;
  autoPlay?: boolean;
  preload?: "none" | "metadata" | "auto";
  initialVolume?: number; // 0..1
  className?: string;
  onEnded?: () => void;
};

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const AudioPlayer = ({
  src,
  title,
  autoPlay = false,
  preload = "metadata",
  initialVolume = 0.8,
  className = "",
  onEnded,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(false); // 🔹 thêm state loop

  const updateProgress = (
    el: EventTarget & HTMLInputElement,
    value?: number
  ) => {
    const val = value !== undefined ? value : parseFloat(el.value);
    const min = el.min ? parseFloat(el.min) : 0;
    const max = el.max ? parseFloat(el.max) : 100;
    const percent = ((val - min) / (max - min)) * 100;

    el.style.setProperty("--range-progress-percent", percent + "%");
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
        if (progressRef.current) {
          updateProgress(progressRef.current, audio.currentTime);
        }
      }
    };

    audio.addEventListener("timeupdate", onTime);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [isSeeking]);

  useEffect(() => {
    const volumeInput = document.getElementById("Volume") as HTMLInputElement;
    if (volumeInput) {
      updateProgress(volumeInput);
    }
  }, [volume, muted]);

  // khởi tạo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setIsReady(true);
      audio.volume = volume;
      audio.muted = muted;
      audio.playbackRate = rate;
      audio.loop = loop;

      if (progressRef.current) updateProgress(progressRef.current);
      const volumeInput = document.getElementById("Volume") as HTMLInputElement;
      if (volumeInput) updateProgress(volumeInput);

      if (autoPlay) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEndedLocal = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEndedLocal);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEndedLocal);
    };
  }, [autoPlay, onEnded, rate, volume, muted, loop]); // 🔹 thêm loop vào dependency

  // phím tắt
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;

      if (e.code === "Space") {
        e.preventDefault();
        isPlaying ? audio.pause() : audio.play();
      } else if (e.code === "ArrowRight") {
        audio.currentTime = Math.min(duration, audio.currentTime + 5);
      } else if (e.code === "ArrowLeft") {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isPlaying, duration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch {
        // autoplay block hoặc lỗi thiết bị
      }
    }
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newLoop = !loop;
    setLoop(newLoop);
    audio.loop = newLoop;
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeek = (v: number) => {
    setCurrentTime(v);
    if (progressRef.current) {
      updateProgress(progressRef.current, v);
    }
  };
  const handleSeekEnd = (v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setIsSeeking(false);
    if (progressRef.current) {
      updateProgress(progressRef.current);
    }
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(duration, audio.currentTime + delta)
    );
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !muted;
    setMuted(newMuted);
    audio.muted = newMuted;
  };

  const changeVolume = (v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setVolume(v);
    audio.volume = v;
    if (v > 0 && muted) {
      setMuted(false);
      audio.muted = false;
    }
  };

  const changeRate = (r: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setRate(r);
    audio.playbackRate = r;
  };

  return (
    <div
      className={
        "w-full max-w-[680px] rounded-xl border border-dashed border-green-one bg-white p-4 " +
        className
      }
    >
      <audio ref={audioRef} src={src} preload={preload} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-gray-700 hover:text-gray-900"
            title={muted ? "Bật tiếng" : "Tắt tiếng"}
          >
            {muted || volume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            onInput={(e) => updateProgress(e.target as HTMLInputElement)}
            className="w-36"
            id="Volume"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <select
            className="border rounded-xl px-2 py-1 font-bold text-green-one outline-none"
            value={rate}
            onChange={(e) => changeRate(parseFloat(e.target.value))}
          >
            {[0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Giữ nguyên toàn bộ phần dưới */}
      <div className="mb-3">
        <input
          ref={progressRef}
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={isSeeking ? currentTime : Math.min(currentTime, duration || 0)}
          onInput={(e) => updateProgress(e.target as HTMLInputElement)}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          onMouseUp={(e) =>
            handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))
          }
          onTouchEnd={(e) =>
            handleSeekEnd(parseFloat((e.target as HTMLInputElement).value))
          }
          className="w-full h-6 -mt-8 relative z-10"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="text-green-gray">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            className="text-green-gray flex items-center gap-1"
            onClick={() => skip(-5)}
          >
            <SkipBack fill="currentColor" size={22} />
          </button>
          <button
            onClick={togglePlay}
            className="rounded-full p-1 flex items-center justify-center bg-green-gray text-white transition"
            disabled={!isReady}
            title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}
          >
            {isPlaying ? (
              <Pause fill="currentColor" size={16} />
            ) : (
              <Play fill="currentColor" size={16} />
            )}
          </button>
          <button
            className="text-green-gray flex items-center gap-1"
            onClick={() => skip(10)}
          >
            <SkipForward fill="currentColor" size={22} />
          </button>
        </div>
        <button
          onClick={toggleLoop}
          className={`rounded-full ${
            loop ? "text-green-one" : "text-green-gray"
          }`}
          title={loop ? "Tắt lặp lại" : "Bật lặp lại"}
        >
          <Repeat size={22} />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
