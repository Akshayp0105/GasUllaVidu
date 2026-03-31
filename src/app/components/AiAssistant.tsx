"use client";

import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AiAssistant.module.css';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI Safety Assistant. How can I help you check cylinder levels or arrange a safe swap today?", type: "ai" }
  ]);
  const [input, setInput] = useState('');

  const sendMsg = (customMsg?: string) => {
    const text = customMsg || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text, type: "user" }]);
    setInput('');

    // Simulate AI response based on keyword
    setTimeout(() => {
      let reply = "I can definitely help with that! Make sure to verify the cylinder owner's trust score before confirming.";
      if (text.toLowerCase().includes('water')) {
         reply = "To do the water test: Pour a mug of water down the side of the cylinder. After 2 minutes, the empty part will dry up, while the part with LPG will remain wet due to cooling condensation.";
      } else if (text.toLowerCase().includes('safe')) {
         reply = "Safety first! Always check for the O-ring inside the valve. Keep the cylinder upright. Do not use matches to check for leaks; use soap water instead.";
      }
      setMessages(prev => [...prev, { id: Date.now(), text: reply, type: "ai" }]);
    }, 1000);
  };

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.botPanel}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className={styles.header}>
              <div className={styles.pulse}></div>
              <span>Safety AI</span>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer'}}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map(m => (
                <div key={m.id} className={`${styles.msg} ${styles[m.type]}`}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className={styles.quickActions}>
              <button className={styles.chip} onClick={() => sendMsg("How do I do the water test?")}>💧 Water Test</button>
              <button className={styles.chip} onClick={() => sendMsg("Is it safe to share?")}>🛡️ Safety Tips</button>
            </div>

            <div className={styles.inputArea}>
              <input 
                type="text" 
                className={styles.inputField}
                placeholder="Ask about cylinder safety..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
              />
              <button className={styles.sendBtn} onClick={() => sendMsg()}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
      >
        <Bot size={28} />
      </motion.button>
    </div>
  );
}
