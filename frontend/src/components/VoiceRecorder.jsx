import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon, SquareIcon, Trash2Icon, SendIcon } from "lucide-react";

const MAX_DURATION_SECONDS = 120; // 2 minutes

function VoiceRecorder({ onSend, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };

      recorder.start(100);
      setIsRecording(true);
      setElapsedSeconds(0);
      setAudioBlob(null);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => {
          if (s + 1 >= MAX_DURATION_SECONDS) {
            stopRecording();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Mic access denied or not supported
    }
  };

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setElapsedSeconds(0);
    cleanup();
  };

  const sendVoiceNote = async () => {
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Normalize data URL: Cloudinary can't parse MIME types with parameters
      // e.g. "data:audio/webm;codecs=opus;base64,..." → "data:audio/webm;base64,..."
      let dataUrl = reader.result;
      const match = dataUrl.match(/^data:([^;]+)(;[^;]*)*;base64,/);
      if (match) {
        const baseMime = match[1]; // "audio/webm"
        const base64Data = dataUrl.split(";base64,")[1];
        dataUrl = `data:${baseMime};base64,${base64Data}`;
      }

      onSend({
        audio: dataUrl,
        audioDuration: elapsedSeconds,
      });
      setAudioBlob(null);
      setElapsedSeconds(0);
    };
    reader.readAsDataURL(audioBlob);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Recording state
  if (isRecording) {
    return (
      <div className="voice-recorder-active flex items-center gap-2">
        <button
          type="button"
          onClick={cancelRecording}
          className="voice-recorder-cancel rounded-full p-3 transition-colors flex-shrink-0"
          style={{
            backgroundColor: "rgba(224, 95, 95, 0.12)",
            color: "var(--danger)",
            border: "1px solid rgba(224, 95, 95, 0.2)",
          }}
          title="Cancel recording"
        >
          <Trash2Icon className="w-[18px] h-[18px]" />
        </button>

        <div
          className="voice-recorder-waveform flex-1 flex items-center gap-2 rounded-full py-3 px-4"
          style={{
            backgroundColor: "var(--app-shell-input-bg)",
            border: "1px solid rgba(224, 95, 95, 0.3)",
          }}
        >
          <div className="voice-recorder-pulse-dot" />
          <div className="voice-recorder-bars">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="voice-recorder-bar"
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
          <span
            className="text-xs font-mono font-medium ml-auto flex-shrink-0"
            style={{ color: "var(--danger)" }}
          >
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          type="button"
          onClick={stopRecording}
          className="rounded-full p-3 transition-all flex-shrink-0"
          style={{
            backgroundColor: "var(--danger)",
            color: "var(--text-inverse)",
          }}
          title="Stop recording"
        >
          <SquareIcon className="w-[18px] h-[18px]" fill="currentColor" />
        </button>
      </div>
    );
  }

  // Preview state — audio recorded, ready to send
  if (audioBlob) {
    return (
      <div className="voice-recorder-preview flex items-center gap-2">
        <button
          type="button"
          onClick={cancelRecording}
          className="rounded-full p-3 transition-colors flex-shrink-0"
          style={{
            backgroundColor: "rgba(224, 95, 95, 0.12)",
            color: "var(--danger)",
            border: "1px solid rgba(224, 95, 95, 0.2)",
          }}
          title="Discard"
        >
          <Trash2Icon className="w-[18px] h-[18px]" />
        </button>

        <div
          className="flex-1 flex items-center gap-3 rounded-full py-3 px-4"
          style={{
            backgroundColor: "var(--app-shell-input-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <MicIcon
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--primary)" }}
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Voice note
          </span>
          <span
            className="text-xs font-mono ml-auto flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          type="button"
          onClick={sendVoiceNote}
          className="rounded-full p-3 transition-all flex-shrink-0"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--text-inverse)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary)";
          }}
          title="Send voice note"
        >
          <SendIcon className="w-[18px] h-[18px]" />
        </button>
      </div>
    );
  }

  // Idle state — just the mic button
  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="voice-recorder-idle rounded-full p-3 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "var(--app-shell-input-bg)",
        color: "var(--text-muted)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-focus)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
      title="Record voice note"
    >
      <MicIcon className="w-[18px] h-[18px]" />
    </button>
  );
}

export default VoiceRecorder;
