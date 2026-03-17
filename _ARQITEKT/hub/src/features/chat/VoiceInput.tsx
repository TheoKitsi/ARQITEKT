import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import styles from './VoiceInput.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface VoiceInputProps {
  onResult: (text: string) => void;
}

/* ------------------------------------------------------------------ */
/*  SpeechRecognition type augmentation                                */
/* ------------------------------------------------------------------ */

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function VoiceInput({ onResult }: VoiceInputProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /* ---- Clean up on unmount ---- */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  /* ---- Toggle recording ---- */
  const toggleRecording = useCallback(() => {
    // Stop recording
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    // Check browser support
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      showToast(t('voiceNotSupported'), 'warning');
      return;
    }

    // Start recording
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = document.documentElement.lang || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(
        { length: event.results.length },
        (_, i) => event.results[i]?.[0]?.transcript ?? '',
      ).join(' ');

      if (transcript.trim()) {
        onResult(transcript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        showToast(`${t('voiceError')}${event.error}`, 'error');
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      showToast(t('voiceNotSupported'), 'warning');
    }
  }, [isRecording, onResult, showToast, t]);

  return (
    <button
      type="button"
      className={`${styles.voiceBtn} ${isRecording ? styles.recording : ''}`}
      onClick={toggleRecording}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      aria-pressed={isRecording}
    >
      {isRecording ? (
        <>
          <MicOff size={16} />
          <span className={styles.recordingDot} />
        </>
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}
