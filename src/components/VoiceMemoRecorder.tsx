'use client';

import { useState, useRef, useEffect } from 'react';
import { VoiceMemo } from '@/types/event';

interface VoiceMemoRecorderProps {
  onSave: (memo: VoiceMemo) => void;
  onCancel?: () => void;
}

export default function VoiceMemoRecorder({ onSave, onCancel }: VoiceMemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if MediaRecorder API is supported
    if (typeof window !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsSupported(true);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = await blobToDataURL(audioBlob);
        const duration = recordingTime;

        const memo: VoiceMemo = {
          id: Date.now().toString(),
          audioUrl,
          duration,
          timestamp: new Date(),
        };

        onSave(memo);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Reset state
        setRecordingTime(0);
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (onCancel) {
      onCancel();
    }
  };

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="bg-muted/50 border-2 border-border spacing-mathematical">
        <div className="text-sm text-muted-foreground font-mono">
          Voice memo recording is not supported in your browser.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border-2 border-destructive spacing-mathematical">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-mono text-destructive">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border spacing-mathematical">
      {!isRecording ? (
        // Start Recording Button
        <button
          type="button"
          onClick={startRecording}
          className="w-full brutalist-button bg-primary text-primary-foreground flex items-center justify-center gap-2"
          style={{ padding: 'var(--space-md)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span className="font-mono font-bold uppercase">[RECORD_VOICE_MEMO]</span>
        </button>
      ) : (
        // Recording Controls
        <div className="space-y-4">
          {/* Recording Indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-2xl font-mono font-bold text-foreground">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Waveform Visualization (simplified) */}
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary transition-all duration-150"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: isPaused ? 0.3 : 1,
                }}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isPaused ? (
              <button
                type="button"
                onClick={pauseRecording}
                className="flex-1 brutalist-button bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
                style={{ padding: 'var(--space-sm)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span className="font-mono text-sm">PAUSE</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRecording}
                className="flex-1 brutalist-button bg-primary text-primary-foreground flex items-center justify-center gap-2 animate-pulse"
                style={{ padding: 'var(--space-sm)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="font-mono text-sm">RESUME</span>
              </button>
            )}
            <button
              type="button"
              onClick={stopRecording}
              className="flex-1 brutalist-button bg-accent text-accent-foreground flex items-center justify-center gap-2"
              style={{ padding: 'var(--space-sm)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              <span className="font-mono text-sm">SAVE</span>
            </button>
            <button
              type="button"
              onClick={cancelRecording}
              className="flex-1 brutalist-button bg-destructive text-destructive-foreground flex items-center justify-center gap-2"
              style={{ padding: 'var(--space-sm)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-mono text-sm">CANCEL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
