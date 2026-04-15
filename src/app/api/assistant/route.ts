import { NextResponse } from 'next/server';

import {
  buildFallbackReply,
  buildSystemPrompt,
  getSuggestions,
  inferIntent,
  inferSafetyLevel,
  sanitizeConversation,
  type AssistantMessage,
} from '@/lib/assistant';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

function buildOpenAIMessages(messages: AssistantMessage[]) {
  const sanitized = sanitizeConversation(messages);
  return [
    { role: 'system', content: buildSystemPrompt() },
    ...sanitized.map((m) => ({ role: m.role, content: m.content })),
  ];
}

export async function POST(request: Request) {
  let body: { messages?: AssistantMessage[]; stream?: boolean };

  try {
    body = (await request.json()) as { messages?: AssistantMessage[]; stream?: boolean };
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const latestUser = [...messages].reverse().find((m) => m.role === 'user');

  if (!latestUser) {
    return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });
  }

  const fallbackReply = buildFallbackReply(latestUser.content);

  if (!OPENAI_API_KEY) {
    console.warn('[Assistant] OPENAI_API_KEY not set — using fallback replies.');
    return NextResponse.json(fallbackReply);
  }

  const openaiMessages = buildOpenAIMessages(messages);

  if (body.stream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';

        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: OPENAI_MODEL,
              messages: openaiMessages,
              temperature: 0.75,
              max_tokens: 600,
              stream: true,
            }),
          });

          if (!res.ok || !res.body) {
            send('chunk', { delta: fallbackReply.answer });
            send('meta', {
              intent: fallbackReply.intent,
              safety: fallbackReply.safety,
              suggestions: fallbackReply.suggestions,
              followUp: fallbackReply.followUp,
              source: 'fallback',
            });
            send('done', { ok: true });
            controller.close();
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const chunk = line.slice(6).trim();
              if (!chunk || chunk === '[DONE]') continue;

              try {
                const event = JSON.parse(chunk) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = event.choices?.[0]?.delta?.content ?? '';
                if (delta) {
                  fullText += delta;
                  send('chunk', { delta });
                }
              } catch {
                // skip malformed
              }
            }
          }

          const finalText = fullText.trim() || fallbackReply.answer;
          const intent = inferIntent(latestUser.content);
          const safety = inferSafetyLevel(`${latestUser.content}\n${finalText}`, intent);
          const suggestions = getSuggestions(intent, latestUser.content);

          send('meta', {
            intent,
            safety,
            suggestions,
            followUp: '',
            source: fullText.trim() ? 'openai' : 'fallback',
          });
          send('done', { ok: true });
        } catch (err) {
          console.error('[Assistant] Streaming error:', err);
          send('chunk', { delta: fallbackReply.answer });
          send('meta', {
            intent: fallbackReply.intent,
            safety: fallbackReply.safety,
            suggestions: fallbackReply.suggestions,
            followUp: fallbackReply.followUp,
            source: 'fallback',
          });
          send('done', { ok: true });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  // Non-streaming
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        temperature: 0.75,
        max_tokens: 600,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = data.choices?.[0]?.message?.content?.trim() || fallbackReply.answer;
    const intent = inferIntent(latestUser.content);
    const safety = inferSafetyLevel(`${latestUser.content}\n${answer}`, intent);
    const suggestions = getSuggestions(intent, latestUser.content);

    return NextResponse.json({
      answer,
      intent,
      safety,
      suggestions,
      followUp: '',
      source: answer !== fallbackReply.answer ? 'openai' : 'fallback',
    });
  } catch (err) {
    console.error('[Assistant] Non-streaming error:', err);
    return NextResponse.json(fallbackReply);
  }
}
