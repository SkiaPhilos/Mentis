import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { resolveDecryptedApiKey } from '@/lib/ai/vault';

export async function POST(req: NextRequest) {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      encryptedKey,
      magicSpell,
      model = 'gemini-3.8-flash',
    } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'No image manuscript payload provided for OCR.' },
        { status: 400 }
      );
    }

    // Strip data URL header if present
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const { apiKey } = await resolveDecryptedApiKey({ encryptedKey });

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'The Mentis OCR Vision Engine requires a configured Magical Key or Academy Magic Code.',
        },
        { status: 403 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const targetModel =
      model.includes('gemini-3.8') || model.includes('gemini-3.1')
        ? model
        : 'gemini-3.8-flash';

    const prompt = `You are the Mentis Scholarly Scribe and Vision Engine. 
Examine this study image, screenshot, handwritten folio, or textbook page:
1. Transcribe all text with high academic precision, preserving structural hierarchy, bullet points, tables, and paragraphs.
2. For mathematical equations, chemical formulas, or physics theorems, format them using standard LaTeX syntax ($inline$ or $$block$$).
3. If diagrams, figures, or sketches are present, provide a brief bracketed description (e.g. [Diagram: Commutative diagram of homological functors]).
4. Provide a recommended manuscript title based on the transcribed subject matter.

Respond strictly in JSON format matching this schema:
{
  "title": "string",
  "extractedText": "string",
  "detectedLanguage": "string",
  "summary": "string"
}`;

    const result = await ai.models.generateContent({
      model: targetModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const rawJson = result.text || '{}';
    let parsed: {
      title?: string;
      extractedText?: string;
      detectedLanguage?: string;
      summary?: string;
    } = {};

    try {
      parsed = JSON.parse(rawJson);
    } catch {
      parsed = {
        title: 'Transcribed Manuscript',
        extractedText: result.text || '',
        detectedLanguage: 'English',
        summary: 'Transcribed study excerpt.',
      };
    }

    return NextResponse.json({
      title: parsed.title || 'Transcribed Manuscript Excerpt',
      extractedText: parsed.extractedText || result.text || '',
      detectedLanguage: parsed.detectedLanguage || 'Academic English',
      summary: parsed.summary || '',
    });
  } catch (err: any) {
    console.error('Mentis OCR error:', err);
    return NextResponse.json(
      {
        error: 'OCR_SYNTHESIS_FAILED',
        message: err.message || 'Vision transcription encountered a celestial interference.',
      },
      { status: 500 }
    );
  }
}
