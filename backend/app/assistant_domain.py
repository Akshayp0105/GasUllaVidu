from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

AssistantIntent = Literal[
    "water-test",
    "safety",
    "swap",
    "availability",
    "pricing",
    "emergency",
    "greeting",
    "general",
]
AssistantSafetyLevel = Literal["safe", "caution", "urgent"]


@dataclass(frozen=True)
class AssistantReply:
    answer: str
    intent: AssistantIntent
    safety: AssistantSafetyLevel
    suggestions: list[str]
    follow_up: str
    source: Literal["openai", "fallback"]


KNOWLEDGE_BASE = """
You are the Safety AI backend for GasUllaVidu.

Scope:
- Domestic LPG cylinder guidance for Indian household usage.
- Handoffs, temporary sharing, pickup, verification, transport, inspection, and emergency response.

Behavior:
- Answer naturally like a strong conversational AI.
- Be helpful on greetings and casual conversation; do not always jump straight into canned safety text.
- When the user asks simple social questions like "who are you", explain your role clearly.
- Keep safety critical guidance decisive and specific.
- Ask one clarifying question if essential context is missing.
- Never suggest flame-based leak testing or unsafe handling.

Emergency handling:
- If there is a gas smell, hissing, fire, regulator failure, or suspected live leak:
  tell the user to avoid flames and electrical switches, ventilate only if safe, close the regulator if safe, move people away, and contact local gas or fire emergency services immediately.

Swap handling:
- Encourage identity verification, visible inspection, upright transport, seal/O-ring checks, and rejection of damaged cylinders.

Water test:
- Explain the condensation/drying line method simply.
""".strip()


INTENT_KEYWORDS: dict[AssistantIntent, list[str]] = {
    "water-test": ["water test", "condensation", "gas level", "remaining gas", "how much gas", "level check"],
    "safety": ["safe", "safety", "leak", "o-ring", "regulator", "valve", "upright", "soap water"],
    "swap": ["swap", "exchange", "share", "borrow", "lend", "return", "handoff", "owner"],
    "availability": ["available", "availability", "nearby", "find cylinder", "who has", "where can i get"],
    "pricing": ["price", "cost", "deposit", "fee", "charge", "payment"],
    "emergency": ["fire", "smell gas", "gas smell", "emergency", "urgent", "explosion", "spark", "hissing"],
    "greeting": ["hi", "hello", "hey", "who are you", "what can you do", "introduce yourself"],
    "general": [],
}

EMERGENCY_SIGNALS = ["fire", "smell gas", "gas smell", "hissing", "spark", "explosion", "emergency", "urgent"]
CAUTION_SIGNALS = ["leak", "damaged", "rust", "regulator", "valve", "unsafe", "crack"]

SUGGESTIONS: dict[AssistantIntent, list[str]] = {
    "water-test": [
        "How do I read the water test result?",
        "What if the cylinder feels cold already?",
        "When should I replace a low cylinder?",
    ],
    "safety": [
        "Give me a home leak-check checklist",
        "What should I inspect before connecting a regulator?",
        "What are unsafe signs during delivery?",
    ],
    "swap": [
        "How do I verify a safe cylinder swap?",
        "What should I confirm before sharing my cylinder?",
        "Write a short handoff checklist",
    ],
    "availability": [
        "Help me ask for a nearby cylinder politely",
        "What details should I request from the owner?",
        "How quickly should I inspect after pickup?",
    ],
    "pricing": [
        "What costs should be clarified before pickup?",
        "How do I avoid deposit disputes?",
        "Draft a fair pricing message",
    ],
    "emergency": [
        "What should I do right now if I smell gas?",
        "When should I call emergency services?",
        "What should I never do during a leak?",
    ],
    "greeting": [
        "How do I do the water test?",
        "Give me cylinder safety tips",
        "How can I arrange a safe swap?",
    ],
    "general": [
        "How do I do the water test?",
        "Give me cylinder safety tips",
        "How can I arrange a safe swap?",
    ],
}


def infer_intent(text: str) -> AssistantIntent:
    normalized = text.lower().strip()

    for intent, keywords in INTENT_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return intent

    return "general"


def infer_safety_level(text: str, intent: AssistantIntent | None = None) -> AssistantSafetyLevel:
    normalized = text.lower()

    if any(signal in normalized for signal in EMERGENCY_SIGNALS) or intent == "emergency":
        return "urgent"

    if any(signal in normalized for signal in CAUTION_SIGNALS) or intent in {"safety", "swap"}:
        return "caution"

    return "safe"


def get_suggestions(intent: AssistantIntent, text: str = "") -> list[str]:
    normalized = text.lower()

    if intent == "general" and "delivery" in normalized:
        return [
            "What should I inspect during delivery?",
            "How do I reject an unsafe cylinder?",
            "Give me a delivery safety checklist",
        ]

    return SUGGESTIONS[intent]


def fallback_reply(user_text: str) -> AssistantReply:
    intent = infer_intent(user_text)
    safety = infer_safety_level(user_text, intent)
    suggestions = get_suggestions(intent, user_text)

    if safety == "urgent":
        return AssistantReply(
            answer=(
                "This sounds like a possible LPG emergency. Do not use flames or electrical switches. "
                "If it is safe, ventilate the area, close the regulator, move people away, and contact local gas or fire emergency services immediately."
            ),
            intent=intent,
            safety=safety,
            suggestions=suggestions,
            follow_up="If you want, I can give you a 2-minute emergency checklist right now.",
            source="fallback",
        )

    if intent == "greeting":
        return AssistantReply(
            answer=(
                "I'm Safety AI for GasUllaVidu. I help with LPG cylinder safety, water level checks, safe sharing and swap guidance, "
                "pickup inspection, and emergency precautions."
            ),
            intent=intent,
            safety=safety,
            suggestions=suggestions,
            follow_up="Ask me anything naturally, and I'll answer like a conversational assistant while keeping the guidance safety-focused.",
            source="fallback",
        )

    if intent == "water-test":
        return AssistantReply(
            answer=(
                "Pour normal water down one side of the cylinder and wait about 1 to 2 minutes. "
                "The part with LPG stays cooler and may remain damp longer, while the emptier upper section dries faster."
            ),
            intent=intent,
            safety=safety,
            suggestions=suggestions,
            follow_up="If you want, I can explain how to read unclear water test results.",
            source="fallback",
        )

    if intent == "safety":
        return AssistantReply(
            answer=(
                "Keep the cylinder upright, inspect the valve and O-ring before connecting, and use soap solution instead of flame to check for leaks. "
                "Do not use the cylinder if you notice strong smell, loose fit, regulator issues, or visible damage."
            ),
            intent=intent,
            safety=safety,
            suggestions=suggestions,
            follow_up="I can turn that into a short pre-use checklist if you want.",
            source="fallback",
        )

    if intent == "swap":
        return AssistantReply(
            answer=(
                "Before accepting a cylinder swap, verify who owns it, inspect the valve area and body condition, ask about refill timing, "
                "and keep transport upright. Reject any cylinder with leak signs, missing seal integrity, or heavy rust damage."
            ),
            intent=intent,
            safety=safety,
            suggestions=suggestions,
            follow_up="I can also draft a handoff checklist message for the other user.",
            source="fallback",
        )

    return AssistantReply(
        answer=(
            "I can help with cylinder safety, gas level checks, swap guidance, availability questions, and emergency precautions. "
            "Ask in plain language and I'll keep the answer practical."
        ),
        intent=intent,
        safety=safety,
        suggestions=suggestions,
        follow_up="Try asking who I am, how to do the water test, or how to check a cylinder safely before pickup.",
        source="fallback",
    )
