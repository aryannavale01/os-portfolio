import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import {
  ARYAN_PROFILE,
  SKILLS_CATEGORIZED,
  PROJECTS_DATA,
  EDUCATION,
  COURSEWORK,
  ACHIEVEMENTS,
} from '@/content/aryan';

export const runtime = 'nodejs';

const GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const MAX_INPUT_LENGTH = 300;
const RATE_LIMIT_MAX = 6;
const RATE_LIMIT_WINDOW_MS = 60_000;

const REDIRECT_MESSAGE =
  "I'm just here to answer questions about Aryan and his work — feel free to ask me about his projects, skills, or background!";
const FALLBACK_MESSAGE = 'Something went wrong — try again in a moment.';
const RATE_LIMIT_MESSAGE = "You're asking a lot right now — give me a moment and try again.";

const ABOUT_ARYAN = `You are an AI assistant that knows about ${ARYAN_PROFILE.name} — ${ARYAN_PROFILE.title} from ${ARYAN_PROFILE.location}. ${ARYAN_PROFILE.summary}

Technical skills by category: ${SKILLS_CATEGORIZED.map(
  (cat) => `${cat.category}: ${cat.skills.join(', ')}`
).join('; ')}

Key projects include: ${PROJECTS_DATA.map(
  (p) => `${p.title} — ${p.shortDesc} (${p.techStack.join(', ')})`
).join('; ')}

Education: ${EDUCATION.degree} at ${EDUCATION.college} (${EDUCATION.years}). Relevant coursework: ${COURSEWORK.join(', ')}.

Achievements: ${ACHIEVEMENTS.join(' ')}.

Contact: ${ARYAN_PROFILE.email} | ${ARYAN_PROFILE.github} | ${ARYAN_PROFILE.linkedin}.`;

const SYSTEM_PROMPT = `${ABOUT_ARYAN}

Rules:
1) You only answer questions about Aryan Navale, his background, projects, skills, and work.
2) For anything outside this scope — especially code generation, debugging, or unrelated topics — respond with exactly: ${REDIRECT_MESSAGE}
3) You should not claim to be Aryan or answer as if you are him — always speak about him in the third person.
4) Keep answers to 2–4 sentences.
5) Be honest; if you don't know, say so.`;

const CODE_RE =
  /```|`[a-z]+`|(write|generate|create|code|make|give me|show me|build|implement) (a|an|the|me|up|this|my|some)? .{0,30}(function|class|script|program|regex|api|endpoint|component|route|algorithm|sql|query)|(debug|fix|solve|optimize|refactor) (this|my|the|that)|how (do|can|should) (i|you|we) (write|code|build|create|debug|fix|implement)|(write|show|give) .{0,30}(code|script|program)/i;

const INJECTION_RE =
  /(ignore|disregard|forget|skip|overwrite|override) (all |your |the |my |our |previous |prior |above |earlier )*(instructions|prompt|rules|guidelines|context)|you are now|pretend (you are|to be)|act as|system prompt|from now on|jailbreak|developer mode|do anything now/i;

const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitStore.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitStore.set(ip, recent);
  return false;
}

function jsonReply(reply: string, status: number) {
  return new Response(JSON.stringify({ reply }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return jsonReply(RATE_LIMIT_MESSAGE, 429);
  }

  let body: { message?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonReply(FALLBACK_MESSAGE, 400);
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return jsonReply(FALLBACK_MESSAGE, 400);
  }
  if (message.length > MAX_INPUT_LENGTH) {
    return jsonReply(REDIRECT_MESSAGE, 200);
  }
  if (CODE_RE.test(message) || INJECTION_RE.test(message)) {
    return jsonReply(REDIRECT_MESSAGE, 200);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('Ask AI: GROQ_API_KEY is not configured.');
    return jsonReply(FALLBACK_MESSAGE, 200);
  }

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const response = await client.responses.create({
      model: GROQ_MODEL,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    });
    const reply = response.output_text?.trim();
    if (!reply) {
      throw new Error('Groq returned an empty response.');
    }
    return jsonReply(reply, 200);
  } catch (err) {
    console.error('Ask AI request failed:', err);
    return jsonReply(FALLBACK_MESSAGE, 200);
  }
}
