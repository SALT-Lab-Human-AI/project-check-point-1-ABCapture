import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceRecordingOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

export function useVoiceRecording({ onTranscript, onError }: UseVoiceRecordingOptions = {}) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm'; // fallback

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Good quality, reasonable file size
      });

      audioChunksRef.current = [];

      // Track chunks separately during recording to avoid race conditions
      const pendingChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('[Voice Recording] Data chunk received:', event.data.size, 'bytes');
          pendingChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Voice Recording] MediaRecorder stopped');
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Wait a brief moment to ensure all ondataavailable events have fired
        // MediaRecorder may fire ondataavailable events asynchronously after stop()
        await new Promise(resolve => setTimeout(resolve, 100));

        // Collect all chunks that have been received
        audioChunksRef.current = [...pendingChunks];

        console.log('[Voice Recording] Total chunks collected:', audioChunksRef.current.length);
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log('[Voice Recording] Total audio size:', totalSize, 'bytes');

        if (audioChunksRef.current.length === 0 || totalSize === 0) {
          console.error('[Voice Recording] No audio data collected');
          setError('No audio recorded. Please try speaking louder or check your microphone.');
          setState('error');
          onError?.(new Error('No audio data in recording'));
          return;
        }

        // Combine audio chunks into single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const fileName = `recording-${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`;

        console.log('[Voice Recording] Blob created:', {
          size: audioBlob.size,
          type: audioBlob.type,
          fileName,
        });

        if (audioBlob.size === 0) {
          console.error('[Voice Recording] Blob is empty');
          setError('Audio blob is empty. Please try recording again.');
          setState('error');
          onError?.(new Error('Empty audio blob'));
          return;
        }

        setState('processing');

        try {
          // Send to transcription API
          const formData = new FormData();
          formData.append('audio', audioBlob, fileName);

          console.log('[Voice Recording] Sending FormData:', {
            audioFileSize: audioBlob.size,
            fileName,
            formDataHasAudio: formData.has('audio'),
          });

          const response = await fetch('/api/chat/transcribe-audio', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Transcription failed: ${response.statusText}`);
          }

          const result = await response.json();
          const transcript = result.transcript || '';

          if (transcript.trim()) {
            onTranscript?.(transcript);
            setState('idle');
          } else {
            setError('Empty transcription received');
            setState('error');
            onError?.(new Error('Empty transcription'));
          }
        } catch (err: any) {
          console.error('[Voice Recording] Transcription error:', err);
          setError(err.message || 'Failed to transcribe audio');
          setState('error');
          onError?.(err instanceof Error ? err : new Error(err.message || 'Transcription failed'));
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error('[Voice Recording] MediaRecorder error:', event);
        const error = new Error('Recording error occurred');
        setError(error.message);
        setState('error');
        onError?.(error);
        
        // Stop tracks on error
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setState('recording');
    } catch (err: any) {
      console.error('[Voice Recording] Start error:', err);
      
      let errorMessage = 'Failed to start recording';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setState('error');
      onError?.(new Error(errorMessage));
    }
  }, [onTranscript, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      console.log('[Voice Recording] Stopping MediaRecorder...');
      // Request all remaining data before stopping
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      // Don't set state here - let onstop handler manage it
    }
  }, [state]);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      // Stop all tracks if any are still active
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setState('idle');
    setError(null);
  }, [state]);

  return {
    state,
    error,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    startRecording,
    stopRecording,
    reset,
  };
}
