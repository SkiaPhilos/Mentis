import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { resolveDecryptedApiKey } from '@/app/api/ai/key/route';

export async function POST(req: NextRequest) {
  try {
    const { text, title, encryptedKey, magicSpell, model = 'gemini-3.8-flash' } = await req.json();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'No manuscript text provided for synthesis.' },
        { status: 400 }
      );
    }

    const { apiKey } = await resolveDecryptedApiKey({ encryptedKey });

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'The Mentis synthesis engine requires a configured Magical Key or Academy Magic Code.',
        },
        { status: 403 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this scholarly manuscript text. Provide:
1. A concise, elegant scholarly synthesis (2-3 sentences) capturing core axiomatic derivations and concepts.
2. A refined scholarly title for this note.

Respond strictly in JSON format matching this schema:
{
  "summary": "string",
  "recommendedTitle": "string"
}

Text:
${text.slice(0, 8000)}`;

    const targetModel =
      model.includes('gemini-3.8') || model.includes('gemini-3.1')
        ? model
        : 'gemini-3.8-flash';

    const result = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const rawJson = result.text || '{}';
    let parsed: { summary?: string; recommendedTitle?: string } = {};

    try {
      parsed = JSON.parse(rawJson);
    } catch {
      parsed = {
        summary: rawJson.replace(/```json|```/g, '').trim(),
        recommendedTitle: title || 'Scholarly Synthesis',
      };
    }

    return NextResponse.json({
      summary: parsed.summary || 'Axiomatic synthesis generated.',
      recommendedTitle: parsed.recommendedTitle || title || 'Scholarly Synthesis',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: 'AI_SYNTHESIS_FAILED',
        message: err instanceof Error ? err.message : 'Failed to generate synthesis',
      },
      { status: 500 }
    );
  }
}
