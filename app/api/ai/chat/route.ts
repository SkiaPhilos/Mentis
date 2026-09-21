import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { resolveDecryptedApiKey } from '@/app/api/ai/key/route';

const PERSONA_PROMPTS: Record<string, string> = {
  raziel:
    'You are Raziel, the Deep Scholarly Inquirer in the academic sanctuary of Mentis. Your tone is profound, patient, and dialectical. You trace ideas to their first principles and ontological roots. Write with elevated, elegant prose, avoiding modern corporate buzzwords.',
  azazel:
    'You are Azazel, the Rigorous Academic Critic in Mentis. Your tone is incisive, challenging, and unsparingly precise. You probe counterexamples, challenge weak assumptions, identify logical fallacies, and demand mathematical rigor.',
  raphael:
    'You are Raphael, the Empathetic Scholarly Mentor. Your tone is warm, encouraging, and pedagogically masterly. You decompose intimidating proofs into gentle, intuitive steps without sacrificing intellectual depth.',
  astaroth:
    'You are Astaroth, the Grand Synthesizer of Disciplines. You build daring bridges between physics, history, philosophy, and computation. You illuminate hidden unities across human knowledge.',
  jophiel:
    'You are Jophiel, the Illuminator of Conceptual Beauty. You explain complex theorems through elegant mental models, geometric intuition, and aesthetic clarity.',
};

const MODE_INSTRUCTIONS: Record<string, string> = {
  teacher: 'Conduct a structured, pedagogical masterclass on the topic.',
  socratic: 'Engage solely in Socratic dialogue: do not give the direct answer; ask precise questions that guide the scholar to discover it.',
  practice: 'Pose a rigorous practice problem and wait for the scholar attempt, or walk through a concrete problem step-by-step.',
  revision: 'Deliver a high-yield conceptual review highlighting key formulas, axioms, and common pitfalls.',
  exam: 'Act as a strict academic examiner. Pose formal exam questions with point allocations and evaluate responses with rubric precision.',
  explain: 'Explain this concept using vivid intuition and the Feynman technique so that its inner core is crystal clear.',
  summary: 'Provide an axiomatic summary containing core definitions, theorems, and implications.',
};

const RECOGNIZED_SPELLS = [
  'MENTIS_ACADEMIA_2026',
  'NOCTIS_LUCIS_SOCRATIS',
  'SEEK_TRUTH_ETERNAL',
  'TRIVIUM_QUADRIVIUM_LUMEN',
  'EPISTEME_ET_ARETE',
];

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      persona = 'raziel',
      mode = 'socratic',
      encryptedKey,
      magicSpell,
      model = 'gemini-3.8-flash',
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'No conversation messages provided.' },
        { status: 400 }
      );
    }

    // Server-side decrypted key resolution (Step 5 security architecture)
    const { apiKey, source } = await resolveDecryptedApiKey({ encryptedKey });

    const isAcademicSpell =
      magicSpell && RECOGNIZED_SPELLS.includes(magicSpell.trim().toUpperCase());

    // If no key is resolved and not a recognized spell with fallback
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'The Mentis Socratic guides are currently dormant. Inscribe your Magical Key or an Academy Magic Code in Profile > Scholarly Arcana to awaken them.',
          configured: false,
        },
        { status: 403 }
      );
    }

    // Initialize modern @google/genai client with resolved key
    const ai = new GoogleGenAI({ apiKey });

    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.raziel;
    const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.socratic;

    const systemInstruction = `${personaPrompt}\n\nCURRENT ACADEMIC MODE: ${modeInstruction}\n\nAlways maintain the dignified, scholarly atmosphere of Mentis. Never break character into generic boilerplate. Format formulas and proofs with mathematical precision.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Ensure non-deprecated modern model
    const targetModel =
      model.includes('gemini-3.8') || model.includes('gemini-3.1')
        ? model
        : 'gemini-3.8-flash';

    const result = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = result.text || 'The scholar contemplator returned silence.';

    return NextResponse.json({
      response: responseText,
      model: targetModel,
      source,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'AI communication failure';
    return NextResponse.json(
      {
        error: 'AI_GENERATION_FAILED',
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
