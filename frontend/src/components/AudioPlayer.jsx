import { useState, useRef, useEffect, useCallback } from "react";
import { PlayIcon, PauseIcon } from "lucide-react";

function AudioPlayer({ src, duration, isSent }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setTotalDuration(audioRef.current.duration);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [handleLoadedMetadata]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!audioRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * totalDuration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className="audio-player"
      onClick={(e) => e.stopPropagation()}
      style={{
        "--audio-progress": `${progress}%`,
        "--audio-accent": isSent
          ? "rgba(255, 255, 255, 0.85)"
          : "var(--primary)",
        "--audio-track": isSent
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.1)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        className="audio-player-play-btn"
        onClick={togglePlay}
        style={{
          backgroundColor: isSent
            ? "rgba(255, 255, 255, 0.2)"
            : "var(--primary-muted)",
          color: isSent ? "white" : "var(--primary)",
        }}
      >
        {isPlaying ? (
          <PauseIcon className="w-4 h-4" fill="currentColor" />
        ) : (
          <PlayIcon className="w-4 h-4" fill="currentColor" />
        )}
      </button>

      <div className="audio-player-body">
        <div className="audio-player-waveform-track" onClick={handleSeek}>
          {Array.from({ length: 32 }).map((_, i) => {
            const height = 4 + Math.sin(i * 0.7 + 2) * 8 + Math.random() * 4;
            const filled = (i / 32) * 100 <= progress;
            return (
              <span
                key={i}
                className="audio-player-wave-bar"
                style={{
                  height: `${height}px`,
                  backgroundColor: filled
                    ? "var(--audio-accent)"
                    : "var(--audio-track)",
                }}
              />
            );
          })}
        </div>

        <span className="audio-player-time">
          {isPlaying || currentTime > 0
            ? formatTime(currentTime)
            : formatTime(totalDuration)}
        </span>
      </div>
    </div>
  );
}

export default AudioPlayer;
