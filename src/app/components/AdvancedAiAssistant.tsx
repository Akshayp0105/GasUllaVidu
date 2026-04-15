"use client";

import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './AdvancedAiAssistant.module.css';

type ChatMessage = {
  id: string;
  text: string;
  type: 'assistant' | 'user';
  meta?: {
    intent?: string;
    safety?: 'safe' | 'caution' | 'urgent';
    source?: 'openai' | 'fallback';
  };
};

type AssistantApiReply = {
  answer: string;
  intent: string;
  safety: 'safe' | 'caution' | 'urgent';
  suggestions: string[];
  followUp: string;
  source: 'openai' | 'fallback';
};

const initialSuggestions = [
  'How do I check my cylinder level?',
  'Give me LPG safety tips',
  'How does GasUllaVidu work?',
];

const initialMessage: ChatMessage = {
  id: 'welcome',
  text: "Hi! I'm **GasBot** 🔥 — your AI assistant for GasUllaVidu.\n\nI can help with cylinder level checks, safety tips, swap guidance, finding listings, and emergency precautions.\n\nAsk me anything!",
  type: 'assistant',
  meta: { intent: 'greeting', safety: 'safe', source: 'fallback' },
};

const STORAGE_KEY = 'gasullavidu-ai-session-v2';

// ── Simple markdown renderer (bold, bullet, numbered) ──────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      nodes.push(
        <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <span style={{ color: 'var(--accent, #f97316)', fontWeight: 700, minWidth: '18px' }}>
            {numMatch[1]}.
          </span>
          <span>{renderInline(numMatch[2])}</span>
        </div>,
      );
      continue;
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('• ')) {
      nodes.push(
        <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
          <span style={{ color: 'var(--accent, #f97316)', minWidth: '12px' }}>•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>,
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      nodes.push(<div key={i} style={{ height: '6px' }} />);
      continue;
    }

    // Normal line
    nodes.push(<div key={i}>{renderInline(line)}</div>);
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // **bold**
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
      )}
    </>
  );
}

// ── Typing dots animation ───────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className={styles.typingDots}>
      <span /><span /><span />
    </div>
  );
}

export default function AdvancedAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load persisted session
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { messages?: ChatMessage[]; suggestions?: string[] };
      if (parsed.messages?.length) setMessages(parsed.messages);
      if (parsed.suggestions?.length) setSuggestions(parsed.suggestions);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist session
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, suggestions }));
  }, [messages, suggestions]);

  // Scroll to bottom
  useEffect(() => {
    if (!isOpen) return;
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLoading, isOpen, messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMsg = async (customMsg?: string) => {
    const normalized = (customMsg ?? input).trim();
    if (!normalized || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), text: normalized, type: 'user' };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setRequestError(null);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, text: '', type: 'assistant', meta: { intent: 'general', safety: 'safe', source: 'openai' } },
    ]);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream: true,
          messages: nextMessages.map((m) => ({ role: m.type === 'assistant' ? 'assistant' : 'user', content: m.text })),
        }),
      });

      if (!response.ok) throw new Error('Assistant request failed');

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let metaReceived = false;

        const appendText = (delta: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: `${m.text}${delta}` } : m,
            ),
          );
        };

        const applyMeta = (data: Omit<AssistantApiReply, 'answer'>) => {
          metaReceived = true;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, meta: { intent: data.intent, safety: data.safety, source: data.source } }
                : m,
            ),
          );
          setSuggestions(data.suggestions?.length ? data.suggestions : initialSuggestions);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const block of events) {
            const lines = block.split('\n');
            const eventName = lines.find((l) => l.startsWith('event: '))?.slice(7).trim();
            const dataLine = lines.find((l) => l.startsWith('data: '))?.slice(6).trim();
            if (!eventName || !dataLine) continue;
            try {
              const parsed = JSON.parse(dataLine) as Record<string, unknown>;
              if (eventName === 'chunk' && typeof parsed.delta === 'string' && parsed.delta) {
                appendText(parsed.delta);
              }
              if (eventName === 'meta') {
                applyMeta(parsed as unknown as Omit<AssistantApiReply, 'answer'>);
              }
            } catch { /* skip */ }
          }
        }

        if (!metaReceived) throw new Error('Missing meta event');
      } else {
        const data = (await response.json()) as AssistantApiReply;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text: [data.answer, data.followUp].filter(Boolean).join('\n\n'),
                  meta: { intent: data.intent, safety: data.safety, source: data.source },
                }
              : m,
          ),
        );
        setSuggestions(data.suggestions?.length ? data.suggestions : initialSuggestions);
      }
    } catch {
      setRequestError('Live AI is temporarily unavailable — showing built-in guidance.');
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantId),
        {
          id: assistantId,
          text: "I couldn't reach the live AI right now. I'm using built-in guidance — feel free to ask again!",
          type: 'assistant',
          meta: { intent: 'general', safety: 'caution', source: 'fallback' },
        },
      ]);
      setSuggestions(initialSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([initialMessage]);
    setSuggestions(initialSuggestions);
    setRequestError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const latestAssistant = [...messages].reverse().find((m) => m.type === 'assistant');
  const latestSafety = latestAssistant?.meta?.safety ?? 'safe';
  const latestIntent = latestAssistant?.meta?.intent ?? 'general';
  const latestSource = latestAssistant?.meta?.source ?? 'fallback';

  const safetyLabel =
    latestSafety === 'urgent'
      ? 'Urgent safety alert'
      : latestSafety === 'caution'
      ? 'Caution advised'
      : 'All clear';

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.botPanel}
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.identity}>
                <div className={styles.avatarWrap}>
                  <Bot size={18} />
                </div>
                <div>
                  <span className={styles.title}>GasBot AI</span>
                  <p className={styles.subtitle}>
                    {isLoading ? (
                      <span className={styles.streamingLabel}>
                        <Zap size={10} /> Generating response…
                      </span>
                    ) : (
                      'GasUllaVidu Safety Assistant'
                    )}
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.iconBtn} onClick={resetConversation} aria-label="Reset conversation" title="Clear chat">
                  <RotateCcw size={15} />
                </button>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close assistant">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Status bar */}
            <div className={styles.statusBar}>
              <div className={`${styles.statusPill} ${styles[latestSafety]}`}>
                {latestSafety === 'urgent' ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                <span>{safetyLabel}</span>
              </div>
              <div className={styles.intentTag}>
                <Sparkles size={11} />
                <span>{latestIntent.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Error notice */}
            {requestError && <div className={styles.notice}>{requestError}</div>}

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((message) => (
                <div key={message.id} className={`${styles.msgRow} ${styles[message.type]}`}>
                  {message.type === 'assistant' && (
                    <div className={styles.msgAvatar}>
                      <Bot size={13} />
                    </div>
                  )}
                  <div
                    className={`${styles.msg} ${styles[message.type]} ${
                      message.meta?.safety === 'urgent' ? styles.urgent : ''
                    }`}
                  >
                    {message.id === messages[messages.length - 1]?.id &&
                    message.type === 'assistant' &&
                    isLoading &&
                    message.text === '' ? (
                      <TypingDots />
                    ) : (
                      renderMarkdown(message.text)
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* Suggestions */}
            <div className={styles.quickActions}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className={styles.chip}
                  onClick={() => void sendMsg(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <input
                ref={inputRef}
                type="text"
                className={styles.inputField}
                placeholder="Ask about cylinder safety, level checks, swaps…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void sendMsg(); }}
                disabled={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={() => void sendMsg()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>

            {/* Footer */}
            <div className={styles.footerNote}>
              <span>
                {latestSource === 'openai'
                  ? isLoading
                    ? '⚡ Streaming live AI response'
                    : '✨ Powered by GPT-4.1'
                  : '🔒 Built-in safety mode'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        aria-label="Toggle GasBot AI assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={26} />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && <span className={styles.togglePulse} />}
      </motion.button>
    </div>
  );
}
