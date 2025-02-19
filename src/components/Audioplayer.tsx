import React, { useState, useRef, useEffect } from "react";
import { Play, PauseCircle as CirclePause } from "lucide-react";

interface StreamingAudioPlayerProps {
  text: string;
  disabled?: boolean;
  isLatestMessage: boolean;
}

const StreamingAudioPlayer: React.FC<StreamingAudioPlayerProps> = ({ text, disabled = false, isLatestMessage }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTextRef = useRef<string>(text);
  const hasPlayedRef = useRef<boolean>(false);

  const cleanupAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.pause();
      URL.revokeObjectURL(sourceNodeRef.current.src);
      sourceNodeRef.current = null;
    }
  };

  const cacheAudioData = async (audioData: Blob, text: string) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioData);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          localStorage.setItem(`audio-${text}`, reader.result);
        }
      };
    } catch (error) {
      console.error("Error caching audio:", error);
    }
  };

  const getCachedAudio = (text: string): string | null => {
    return localStorage.getItem(`audio-${text}`);
  };

  const playAudioStream = async () => {
    try {
      cleanupAudio();
      let audioData: Blob;
      const cachedAudio = getCachedAudio(text);
      
      if (cachedAudio) {
        const response = await fetch(cachedAudio);
        audioData = await response.blob();
      } else {
        abortControllerRef.current = new AbortController();
        const response = await fetch("https://scrape-graph-api-dev.ispgnet.com/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice_id: "Joanna" }),
          signal: abortControllerRef.current.signal,
        });

        const chunks: Uint8Array[] = [];
        const reader = response.body?.getReader();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        }
        
        audioData = new Blob(chunks, { type: "audio/mpeg" });
        await cacheAudioData(audioData, text);
      }

      const audio = new Audio(URL.createObjectURL(audioData));
      audio.onended = () => {
        setIsPlaying(false);
        cleanupAudio();
      };
      audio.onerror = (error) => {
        console.error("Audio error:", error);
        setIsPlaying(false);
        cleanupAudio();
      };

      await audio.play();
      sourceNodeRef.current = audio;
      setIsPlaying(true);
      hasPlayedRef.current = true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error playing audio stream:", error);
      }
      setIsPlaying(false);
      cleanupAudio();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!isPlaying && !sourceNodeRef.current) {
      setIsLoading(true);
      await playAudioStream();
    } else if (isPlaying) {
      cleanupAudio();
      setIsPlaying(false);
    } else if (sourceNodeRef.current) {
      try {
        await sourceNodeRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error resuming playback:", error);
        cleanupAudio();
        setIsLoading(true);
        await playAudioStream();
      }
    }
  };

  const autoPlayAudio = async () => {
    if (text && !disabled && !isPlaying && !isLoading && isLatestMessage && !hasPlayedRef.current) {
      setIsLoading(true);
      await playAudioStream();
    }
  };

  useEffect(() => {
    if (currentTextRef.current !== text) {
      cleanupAudio();
      setIsPlaying(false);
      setIsLoading(false);
      currentTextRef.current = text;
      hasPlayedRef.current = false;
      autoPlayAudio();
    }
  }, [text]);

  useEffect(() => {
    hasPlayedRef.current = false;
    if (isLatestMessage) {
      autoPlayAudio();
    }
  }, []);

  return (
    <button
      onClick={togglePlayPause}
      disabled={disabled || isLoading}
      className="bg-black-500 hover:bg-blue-600 text-black py-1 px-2 rounded w-[15%] ml-auto block transition-colors duration-200 flex items-center justify-center rounded-full"
      aria-label={isPlaying ? "Pause speech" : "Play speech"}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <CirclePause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </button>
  );
};

export default StreamingAudioPlayer;
