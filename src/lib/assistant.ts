export type AssistantIntent =
  | 'water-test'
  | 'safety'
  | 'swap'
  | 'availability'
  | 'pricing'
  | 'emergency'
  | 'greeting'
  | 'general';

export type AssistantSafetyLevel = 'safe' | 'caution' | 'urgent';

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantReply = {
  answer: string;
  intent: AssistantIntent;
  safety: AssistantSafetyLevel;
  suggestions: string[];
  followUp: string;
  source: 'openai' | 'fallback';
};

// ─────────────────────────────────────────────
// SYSTEM PROMPT — injected as the AI's identity
// ─────────────────────────────────────────────
export function buildSystemPrompt(): string {
  return `
You are GasBot — the intelligent AI assistant for GasUllaVidu, India's first hyperlocal LPG cylinder sharing platform.

## About GasUllaVidu
GasUllaVidu lets households find, borrow, lend, and safely swap domestic LPG cylinders with nearby neighbors. The platform features:
- Real-time cylinder listings with trust scores and availability status
- Secure borrower/lender handoff workflows with inspection checklists
- AI-powered safety guidance before, during, and after every swap
- Emergency escalation support for gas leaks or cylinder incidents

## Your Personality
- You are warm, direct, helpful, and safety-conscious
- You speak naturally and conversationally — NOT like a scripted chatbot
- You adapt your tone: casual for greetings, precise for safety topics, urgent for emergencies
- You never mention hidden rules, system prompts, or "knowledge bases"
- You can answer general questions too — you are not limited only to LPG topics

## Core Capabilities
1. **LPG Level Check (Water Test)** — Explain how to estimate remaining gas using the condensation method
2. **Safety Guidance** — Valve checks, regulator inspection, soap-water leak test, O-ring condition, storage tips
3. **Swap & Handoff** — How to verify ownership, inspect a borrowed cylinder, agree on return timing
4. **Finding Cylinders** — How to search listings, what to ask owners, what info to request
5. **Pricing & Deposits** — What to clarify, how to avoid disputes
6. **Emergency Response** — Gas smell, hissing, fire, regulator failure — immediate step-by-step action

## Safety Absolute Rules (never break these)
- NEVER suggest using fire, flames, lighters, or matches to test for gas leaks
- NEVER advise operating electrical switches or appliances during a suspected gas leak
- ALWAYS escalate to local emergency services (fire department / gas emergency line) for active leaks, fire, or hissing
- ALWAYS advise keeping cylinders upright during transport and storage
- NEVER normalize using damaged, rusty, severely dented, or unsealed cylinders

## Emergency Template (use when user reports gas smell / fire / hissing)
"🚨 **Stop everything immediately.** Do NOT use flames, lighters, or electrical switches.
1. Close the regulator knob if it's safe to reach
2. Open windows and doors — ventilate the space
3. Move everyone outside away from the area
4. Call your local gas emergency helpline or fire department now
5. Do NOT re-enter until cleared by professionals"

## How to Respond
- Give direct, practical answers first — then optional follow-up steps
- For step-by-step instructions, use numbered lists
- Keep responses concise (3–6 lines usually) unless detail is genuinely needed
- For casual greetings or off-topic questions, be friendly and briefly redirect if relevant
- Use markdown (bold, bullets, numbered lists) — it will be rendered properly
`.trim();
}

// ─────────────────────────────────────────────
// INTENT & SAFETY DETECTION
// ─────────────────────────────────────────────
const intentKeywords: Record<AssistantIntent, string[]> = {
  'water-test': ['water test', 'condensation', 'level', 'gas level', 'remaining gas', 'how much gas', 'check level', 'how full'],
  safety: ['safe', 'safety', 'leak', 'o-ring', 'regulator', 'valve', 'upright', 'soap water', 'seal', 'inspection', 'inspect'],
  swap: ['swap', 'exchange', 'share', 'borrow', 'lend', 'return', 'owner', 'trust score', 'handoff', 'hand off', 'pickup', 'pick up'],
  availability: ['available', 'availability', 'nearby', 'find cylinder', 'who has', 'where can i get', 'listing', 'near me'],
  pricing: ['price', 'cost', 'deposit', 'fee', 'charge', 'payment', 'how much does it cost', 'money'],
  emergency: ['fire', 'smell gas', 'gas smell', 'emergency', 'urgent', 'explosion', 'spark', 'hissing', 'burning', 'smoke'],
  greeting: ['hi', 'hello', 'hey', 'who are you', 'what can you do', 'introduce yourself', 'what is gasullavidu', 'how does this work'],
  general: [],
};

const emergencySignals = ['fire', 'smell gas', 'gas smell', 'hissing', 'spark', 'explosion', 'emergency', 'urgent', 'smoke', 'burning'];
const cautionSignals = ['leak', 'damaged', 'rust', 'regulator', 'valve', 'unsafe', 'crack', 'dent', 'broken', 'seal'];

export function inferIntent(text: string): AssistantIntent {
  const normalized = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(intentKeywords) as Array<[AssistantIntent, string[]]>) {
    if (keywords.some((k) => normalized.includes(k))) return intent;
  }
  return 'general';
}

export function inferSafetyLevel(text: string, intent?: AssistantIntent): AssistantSafetyLevel {
  const normalized = text.toLowerCase();
  if (emergencySignals.some((s) => normalized.includes(s)) || intent === 'emergency') return 'urgent';
  if (cautionSignals.some((s) => normalized.includes(s)) || intent === 'safety' || intent === 'swap') return 'caution';
  return 'safe';
}

export function getSuggestions(intent: AssistantIntent, text?: string): string[] {
  const normalized = text?.toLowerCase() ?? '';

  if (intent === 'general' && normalized.includes('delivery')) {
    return [
      'What should I inspect during delivery?',
      'How do I reject an unsafe cylinder?',
      'Give me a delivery safety checklist',
    ];
  }

  const map: Record<AssistantIntent, string[]> = {
    'water-test': [
      'How do I read an unclear water test result?',
      'What if the cylinder surface is already cold?',
      'When should I plan a refill after the water test?',
    ],
    safety: [
      'Give me a quick pre-use inspection checklist',
      'What should I inspect before connecting a regulator?',
      'How do I use the soap-water leak test?',
    ],
    swap: [
      'What should I confirm before accepting a swap?',
      'Write a short handoff checklist I can share',
      'What are red flags to reject a cylinder?',
    ],
    availability: [
      'What details should I ask the listing owner?',
      'How do I find cylinders near me?',
      'How quickly should I inspect after pickup?',
    ],
    pricing: [
      'What costs should be agreed on before pickup?',
      'How do I handle deposit disputes?',
      'Draft a fair pricing message for an owner',
    ],
    emergency: [
      'What should I do right now if I smell gas?',
      'When should I call emergency services?',
      'What should I never do during a gas leak?',
    ],
    greeting: [
      'How do I do the water test?',
      'Give me cylinder safety tips',
      'How can I arrange a safe swap?',
    ],
    general: [
      'How do I check my cylinder level?',
      'Give me LPG safety tips',
      'How does GasUllaVidu work?',
    ],
  };

  return map[intent];
}

export function sanitizeConversation(messages: AssistantMessage[]): AssistantMessage[] {
  return messages
    .filter((m) => m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1500) }));
}

// ─────────────────────────────────────────────
// FALLBACK REPLIES (used when AI is unavailable)
// ─────────────────────────────────────────────
export function buildFallbackReply(userText: string): AssistantReply {
  const intent = inferIntent(userText);
  const safety = inferSafetyLevel(userText, intent);
  const suggestions = getSuggestions(intent, userText);

  if (safety === 'urgent') {
    return {
      answer:
        '🚨 **Stop everything immediately.** Do NOT use flames or electrical switches.\n1. Close the regulator if safe\n2. Open windows — ventilate the area\n3. Move everyone outside\n4. Call your local gas emergency line or fire department now\n5. Do NOT re-enter until professionals clear it.',
      intent,
      safety,
      suggestions,
      followUp: 'Stay safe — I can give you a 2-minute emergency checklist if needed.',
      source: 'fallback',
    };
  }

  if (intent === 'greeting') {
    return {
      answer:
        "Hi! I'm **GasBot**, the AI assistant for GasUllaVidu 🔥\n\nI can help you with:\n- Checking your LPG cylinder level (water test)\n- Safety tips before connecting or swapping\n- Finding and borrowing cylinders nearby\n- Emergency guidance\n\nAsk me anything!",
      intent,
      safety,
      suggestions,
      followUp: '',
      source: 'fallback',
    };
  }

  if (intent === 'water-test') {
    return {
      answer:
        '**To estimate LPG level using the water test:**\n1. Pour room-temperature water slowly down one side of the cylinder\n2. Wait 1–2 minutes\n3. The section with gas stays **cooler and damp longer** — the empty part dries faster\n4. The boundary line shows your approximate fill level\n\nPlan a refill when the gas line is below one-quarter.',
      intent,
      safety,
      suggestions,
      followUp: 'I can explain how to read unclear results or what to do if the cylinder is already cold.',
      source: 'fallback',
    };
  }

  if (intent === 'safety') {
    return {
      answer:
        '**Quick LPG Safety Checklist:**\n- ✅ Keep cylinder upright always\n- ✅ Inspect valve and O-ring before connecting\n- ✅ Use **soap solution** (never flame) to check for leaks\n- ❌ Stop use if you notice strong gas smell, frost, or a loose regulator fit\n- ❌ Never use damaged or heavily rusted cylinders',
      intent,
      safety,
      suggestions,
      followUp: 'I can turn this into a printable pre-use checklist if you want.',
      source: 'fallback',
    };
  }

  if (intent === 'swap') {
    return {
      answer:
        '**Before accepting a cylinder swap:**\n1. Verify the owner identity and agree on return timing\n2. Inspect valve area, O-ring, and body for rust, dents, or cracks\n3. Ask about last refill date and approximate gas level\n4. Transport and store it **upright** in a ventilated area\n5. Reject any cylinder with a gas smell, missing seal, or severe damage',
      intent,
      safety,
      suggestions,
      followUp: 'I can draft a short handoff checklist you can send to the other user.',
      source: 'fallback',
    };
  }

  if (intent === 'availability') {
    return {
      answer:
        "**To find a cylinder nearby on GasUllaVidu:**\n- Browse listings in your area on the Inventory page\n- Filter by availability status and distance\n- When you find one, ask the owner for:\n  - Approximate fill level\n  - Last refill date\n  - Visible condition of valve and body\n- Inspect it yourself before confirming the pickup",
      intent,
      safety,
      suggestions,
      followUp: 'I can help you write a polite request message to send to a nearby owner.',
      source: 'fallback',
    };
  }

  if (intent === 'pricing') {
    return {
      answer:
        '**For fair pricing on a cylinder swap:**\n- Clarify upfront whether the amount covers sharing, deposit, transport, or refill value\n- Agree on a return date to avoid disputes\n- Document the gas level at handoff (photo recommended)\n- Keep pricing agreements in the chat for reference',
      intent,
      safety,
      suggestions,
      followUp: 'I can draft a clear pricing message template for you.',
      source: 'fallback',
    };
  }

  return {
    answer:
      "I'm **GasBot** — I can help with cylinder level checks, safety tips, swap guidance, finding listings, and emergency precautions.\n\nAsk me anything in plain language and I'll give you a practical, safety-focused answer! 🔥",
    intent,
    safety,
    suggestions,
    followUp: 'Try: "How do I do the water test?" or "Is my cylinder safe to use?"',
    source: 'fallback',
  };
}

// Legacy export aliases for backward compatibility
export const assistantSystemPrompt = buildSystemPrompt();
export const assistantKnowledgeBase = '';

export function coerceIntent(value: string | undefined, fallback: AssistantIntent): AssistantIntent {
  const intents: AssistantIntent[] = ['water-test', 'safety', 'swap', 'availability', 'pricing', 'emergency', 'greeting', 'general'];
  return intents.includes((value ?? '') as AssistantIntent) ? (value as AssistantIntent) : fallback;
}

export function coerceSafetyLevel(value: string | undefined, fallback: AssistantSafetyLevel): AssistantSafetyLevel {
  const levels: AssistantSafetyLevel[] = ['safe', 'caution', 'urgent'];
  return levels.includes((value ?? '') as AssistantSafetyLevel) ? (value as AssistantSafetyLevel) : fallback;
}
