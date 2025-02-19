import React, { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';  // Add Loader import
import { motion } from "framer-motion";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

interface TranscriptionResponse {
  text: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mpeg' });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioUpload = async (audioBlob: Blob): Promise<void> => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');

      const response = await fetch('https://scrape-graph-api-dev.ispgnet.com/translate-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data: TranscriptionResponse = await response.json();
      onTranscriptionComplete(data.text);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <button
          onClick={stopRecording}
          className="relative p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          aria-label="Stop recording"
        >
          <Mic className="h-5 w-5 relative z-10" />
          <motion.span
            className="absolute inset-0 rounded-full bg-red-500 opacity-50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </button>
      ) : isProcessing ? (
        <Loader className="h-5 w-5 animate-spin" />
      ) : (
        <button
          onClick={startRecording}
          className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          disabled={isProcessing}
          aria-label="Start recording"
        >
          <Mic className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;

