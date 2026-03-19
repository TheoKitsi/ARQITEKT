import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Users,
  Layers,
  Monitor,
  Type,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCreateProjectMutation } from '@/store/api/projectsApi';
import { useGetChatConfigQuery } from '@/store/api/chatApi';
import styles from './OnboardingWizard.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WizardMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  phase: number;
}

interface WizardData {
  idea: string;
  audience: string;
  features: string;
  platform: string;
  projectName: string;
}

/* SpeechRecognition browser API types */

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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TOTAL_PHASES = 6;
let nextMsgId = 1;

interface PhaseInfo {
  key: string;
  labelDe: string;
  labelEn: string;
  icon: typeof Lightbulb;
}

const PHASES: PhaseInfo[] = [
  { key: 'idea', labelDe: 'Idee', labelEn: 'Idea', icon: Lightbulb },
  { key: 'audience', labelDe: 'Zielgruppe', labelEn: 'Audience', icon: Users },
  { key: 'features', labelDe: 'Features', labelEn: 'Features', icon: Layers },
  { key: 'platform', labelDe: 'Plattform', labelEn: 'Platform', icon: Monitor },
  { key: 'name', labelDe: 'Name', labelEn: 'Name', icon: Type },
  { key: 'summary', labelDe: 'Zusammenfassung', labelEn: 'Summary', icon: Check },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

function makeId(): number {
  return nextMsgId++;
}

function getPhaseGreeting(phase: number): string {
  switch (phase) {
    case 1:
      return 'Willkommen beim ARQITEKT Wizard! Beschreibe mir deine App-Idee. Was moechtest du bauen?';
    case 2:
      return 'Gut! Jetzt erzaehl mir: Wer ist die Zielgruppe fuer deine App?';
    case 3:
      return 'Verstanden! Welche Kernfunktionen soll deine App haben?';
    case 4:
      return 'Super! Auf welchen Plattformen soll die App laufen? (Web, Android, iOS oder alle)';
    case 5:
      return 'Fast geschafft! Wie soll dein Projekt heissen?';
    case 6:
      return '';
    default:
      return '';
  }
}

function buildSummaryGreeting(data: WizardData): string {
  return (
    `Hier ist die Zusammenfassung deines Projekts:\n\n` +
    `Idee: ${data.idea}\n` +
    `Zielgruppe: ${data.audience}\n` +
    `Features: ${data.features}\n` +
    `Plattform: ${data.platform}\n` +
    `Name: ${data.projectName}\n\n` +
    `Soll ich das Projekt jetzt erstellen? Sage "Ja" um fortzufahren.`
  );
}

function buildWizardSystemPrompt(phase: number, data: WizardData): string {
  const base =
    'Du bist ARQITEKT, ein KI-Assistent fuer Requirements Engineering. ' +
    'Du fuehrst den Benutzer durch den Prozess von der Idee bis zur fertigen Applikation. ' +
    'Antworte auf Deutsch, kurz und praezise (maximal 2-3 Saetze).';

  switch (phase) {
    case 1:
      return (
        `${base}\n` +
        'Der Benutzer beschreibt seine App-Idee. Stelle Rueckfragen um die Idee zu konkretisieren. ' +
        'Wenn genug Informationen vorliegen, sage "Perfekt, lassen Sie uns zur Zielgruppe uebergehen." ' +
        'und fuege [NEXT_PHASE] am Ende hinzu.'
      );
    case 2:
      return (
        `${base}\nIdee: ${data.idea}\n` +
        'Frage nach der Zielgruppe. Wer sind die Nutzer? B2C, B2B oder beide? Wenn klar, sage [NEXT_PHASE].'
      );
    case 3:
      return (
        `${base}\nIdee: ${data.idea}\nZielgruppe: ${data.audience}\n` +
        'Frage nach den Kernfunktionen/Features. Was soll die App koennen? Wenn genug, sage [NEXT_PHASE].'
      );
    case 4:
      return (
        `${base}\nIdee: ${data.idea}\n` +
        'Frage welche Plattformen (Web, Android, iOS oder alle). Wenn klar, sage [NEXT_PHASE].'
      );
    case 5:
      return (
        `${base}\nIdee: ${data.idea}\n` +
        'Frage nach dem Projektnamen. Wenn gegeben, sage [NEXT_PHASE].'
      );
    case 6:
      return (
        `${base}\n` +
        `Fasse das Projekt zusammen:\n` +
        `Idee: ${data.idea}\nZielgruppe: ${data.audience}\n` +
        `Features: ${data.features}\nPlattform: ${data.platform}\nName: ${data.projectName}\n` +
        'Frage ob der Benutzer bereit ist, das Projekt zu erstellen. Sage [CREATE_PROJECT] wenn er bestaetigt.'
      );
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OnboardingWizard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  /* ---- State ---- */
  const [phase, setPhase] = useState(1);
  const [messages, setMessages] = useState<WizardMessage[]>([
    { id: makeId(), role: 'assistant', content: getPhaseGreeting(1), phase: 1 },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  /* Model */
  const { data: chatConfig } = useGetChatConfigQuery();
  const [selectedModel, setSelectedModel] = useState('');

  /* Project creation */
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  /* Refs */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wizardData = useRef<WizardData>({
    idea: '',
    audience: '',
    features: '',
    platform: '',
    projectName: '',
  });
  const sendRef = useRef<(text: string) => void>(() => {});

  /* ---- Set default model when config loads ---- */
  useEffect(() => {
    if (chatConfig?.defaultModel && !selectedModel) {
      setSelectedModel(chatConfig.defaultModel);
    }
  }, [chatConfig, selectedModel]);

  /* ---- Auto-scroll messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ---- TTS ---- */
  const speakText = useCallback(
    (text: string) => {
      if (!ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 1.0;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled],
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  /* ---- Advance phase ---- */
  const advancePhase = useCallback(
    (next: number) => {
      if (next > TOTAL_PHASES) return;
      setPhase(next);

      let greeting: string;
      if (next === 6) {
        greeting = buildSummaryGreeting(wizardData.current);
      } else {
        greeting = getPhaseGreeting(next);
      }

      if (greeting) {
        const msg: WizardMessage = { id: makeId(), role: 'assistant', content: greeting, phase: next };
        setMessages((prev) => [...prev, msg]);
        speakText(greeting);
      }
    },
    [speakText],
  );

  /* ---- Send message to LLM ---- */
  const sendToLLM = useCallback(
    async (userMessage: string) => {
      const trimmed = userMessage.trim();
      if (!trimmed) return;

      const currentPhase = phase;

      /* Add user message */
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'user', content: trimmed, phase: currentPhase },
      ]);
      setInputText('');

      /* Update wizard data ref */
      const d = wizardData.current;
      switch (currentPhase) {
        case 1:
          d.idea = d.idea ? `${d.idea}\n${trimmed}` : trimmed;
          break;
        case 2:
          d.audience = d.audience ? `${d.audience}\n${trimmed}` : trimmed;
          break;
        case 3:
          d.features = d.features ? `${d.features}\n${trimmed}` : trimmed;
          break;
        case 4:
          d.platform = d.platform ? `${d.platform}\n${trimmed}` : trimmed;
          break;
        case 5:
          d.projectName = trimmed;
          break;
      }

      /* Phase 6: simple confirmation check */
      if (currentPhase === 6) {
        const isConfirm = /^(ja|yes|ok|jep|sicher|klar|los|machen|erstellen)/i.test(trimmed);
        if (isConfirm) {
          setIsThinking(true);
          try {
            const project = await createProject({
              name: d.projectName || 'Neues Projekt',
              description: d.idea,
            }).unwrap();
            showToast(
              `${t('wizCreated', 'Projekt erstellt')}: ${project.config.name}`,
              'success',
            );
            navigate(`/projects/${project.id}/plan`);
          } catch {
            showToast(t('errorLoad', 'Fehler beim Erstellen'), 'error');
            setIsThinking(false);
          }
          return;
        }
      }

      /* Build system prompt */
      const systemPrompt = buildWizardSystemPrompt(currentPhase, { ...d });

      setIsThinking(true);
      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            model: selectedModel || undefined,
            context: systemPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const responseData = (await response.json()) as { content?: string };
        let content = responseData.content ?? '';

        /* Check for control tokens */
        const hasNextPhase = content.includes('[NEXT_PHASE]');
        const hasCreateProject = content.includes('[CREATE_PROJECT]');

        /* Strip tokens from displayed text */
        content = content
          .replace(/\[NEXT_PHASE\]/g, '')
          .replace(/\[CREATE_PROJECT\]/g, '')
          .trim();

        /* Add assistant message */
        if (content) {
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: 'assistant', content, phase: currentPhase },
          ]);
          speakText(content);
        }

        /* Handle control tokens */
        if (hasCreateProject) {
          try {
            const project = await createProject({
              name: d.projectName || 'Neues Projekt',
              description: d.idea,
            }).unwrap();
            showToast(
              `${t('wizCreated', 'Projekt erstellt')}: ${project.config.name}`,
              'success',
            );
            navigate(`/projects/${project.id}/plan`);
          } catch {
            showToast(t('errorLoad', 'Fehler beim Erstellen'), 'error');
          }
        } else if (hasNextPhase && currentPhase < TOTAL_PHASES) {
          advancePhase(currentPhase + 1);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'assistant',
            content: `Entschuldigung, es gab einen Fehler: ${errorMsg}. Bitte versuche es erneut.`,
            phase: currentPhase,
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [phase, selectedModel, createProject, navigate, showToast, t, speakText, advancePhase],
  );

  /* Keep sendRef in sync for speech recognition callbacks */
  useEffect(() => {
    sendRef.current = sendToLLM;
  }, [sendToLLM]);

  /* ---- Form submit ---- */
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      /* Stop recording if active */
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
        setIsListening(false);
      }
      if (inputText.trim()) {
        sendToLLM(inputText);
      }
    },
    [inputText, sendToLLM],
  );

  /* ---- Manual skip to next phase ---- */
  const handleSkip = useCallback(() => {
    if (phase < TOTAL_PHASES) {
      advancePhase(phase + 1);
    }
  }, [phase, advancePhase]);

  /* ---- Go back to previous phase ---- */
  const handleBack = useCallback(() => {
    if (phase > 1) {
      setPhase(phase - 1);
      setMessages((prev) => prev.filter((m) => m.phase !== phase));
    }
  }, [phase]);

  /* ---- Start over (restart wizard) ---- */
  const handleRestart = useCallback(() => {
    if (!confirm(t('wizRestartConfirm', 'Start over? All progress will be lost.'))) return;
    setPhase(1);
    setMessages([]);
    setInputText('');
    wizardData.current = { idea: '', audience: '', features: '', platform: '', projectName: '' };
    advancePhase(1);
  }, [advancePhase, t]);

  /* ---- Voice: toggle recording ---- */
  const toggleListening = useCallback(() => {
    /* Stop */
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    /* Check browser support */
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      showToast(t('voiceNotSupported', 'Spracheingabe nicht unterstuetzt'), 'warning');
      return;
    }

    /* Stop TTS while listening */
    stopSpeaking();

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'de-DE';

    let transcript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.[0]) {
          transcript += result[0].transcript + ' ';
        }
      }
      transcript = transcript.trim();
      setInputText(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        showToast(`${t('voiceError', 'Sprachfehler: ')}${event.error}`, 'error');
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      /* Auto-submit the transcript */
      if (transcript) {
        sendRef.current(transcript);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      showToast(t('voiceNotSupported', 'Spracheingabe nicht unterstuetzt'), 'warning');
    }
  }, [isListening, showToast, t, stopSpeaking]);

  /* ---- Close wizard ---- */
  const handleClose = useCallback(() => {
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
    navigate('/');
  }, [navigate]);

  /* ---- Toggle TTS ---- */
  const handleTtsToggle = useCallback(() => {
    setTtsEnabled((v) => !v);
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [isSpeaking, stopSpeaking]);

  /* ---- Phase label helper ---- */
  const isEnglish = i18n.language === 'en';

  const isBusy = isThinking || isCreating;

  return (
    <div className={styles.wizard}>
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>ARQITEKT Wizard</h2>
        <div className={styles.headerActions}>
          {/* TTS toggle */}
          <button
            type="button"
            className={`${styles.iconBtn} ${isSpeaking ? styles.iconBtnActive : ''}`}
            onClick={handleTtsToggle}
            aria-label={ttsEnabled ? 'TTS deaktivieren' : 'TTS aktivieren'}
            title={ttsEnabled ? 'TTS deaktivieren' : 'TTS aktivieren'}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Model selector */}
          {chatConfig?.availableModels && chatConfig.availableModels.length > 0 && (
            <select
              className={styles.modelSelect}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              aria-label={t('model', 'Model')}
            >
              {chatConfig.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Start over */}
          {phase > 1 && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleRestart}
              aria-label={t('wizRestart', 'Neu starten')}
              title={t('wizRestart', 'Neu starten')}
            >
              <RotateCcw size={18} />
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleClose}
            aria-label={t('wizClose', 'Abbrechen')}
            title={t('wizClose', 'Abbrechen')}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className={styles.body}>
        {/* Left: Phase stepper */}
        <nav className={styles.stepper} aria-label="Wizard phases">
          {PHASES.map((p, idx) => {
            const num = idx + 1;
            const Icon = p.icon;
            const isActive = num === phase;
            const isDone = num < phase;
            return (
              <div
                key={p.key}
                className={[
                  styles.stepItem,
                  isActive ? styles.stepItemActive : '',
                  isDone ? styles.stepItemDone : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.stepCircle}>
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className={styles.stepLabel}>
                  {isEnglish ? p.labelEn : p.labelDe}
                </span>
                {num < TOTAL_PHASES && <div className={styles.stepLine} />}
              </div>
            );
          })}
        </nav>

        {/* Center: Chat area */}
        <div className={styles.chatArea}>
          {/* Messages */}
          <div className={styles.messagesScroll}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  styles.message,
                  msg.role === 'user' ? styles.messageUser : styles.messageAssistant,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.messageContent}>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={styles.messageLine}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className={`${styles.message} ${styles.messageAssistant}`}>
                <div className={styles.thinkingDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className={styles.inputArea}>
            {/* Listening indicator */}
            {isListening && (
              <div className={styles.listeningBadge}>
                <span className={styles.listeningPulse} />
                {t('wizListening', 'Ich hoere zu...')}
              </div>
            )}

            <form className={styles.inputForm} onSubmit={handleSubmit}>
              <input
                type="text"
                className={styles.textInput}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('wizTypePlaceholder', 'Nachricht eingeben...')}
                disabled={isBusy}
                autoFocus
              />

              {/* Mic button (push-to-talk) */}
              <button
                type="button"
                className={[styles.micBtn, isListening ? styles.micBtnRecording : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={toggleListening}
                disabled={isBusy}
                aria-label={
                  isListening
                    ? t('wizStopRecording', 'Aufnahme stoppen')
                    : t('wizStartRecording', 'Spracheingabe starten')
                }
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              {/* Send button */}
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!inputText.trim() || isBusy}
                aria-label={t('wizSend', 'Senden')}
              >
                <Send size={18} />
              </button>
            </form>

            {/* Back / Skip phase buttons */}
            <div className={styles.navButtons}>
              {phase > 1 && (
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={handleBack}
                  disabled={isBusy}
                >
                  <ArrowLeft size={14} />
                  {t('wizBack', 'Zurueck')}
                </button>
              )}
              {phase < TOTAL_PHASES && (
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={handleSkip}
                  disabled={isBusy}
                >
                  {t('wizNext', 'Weiter')}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
