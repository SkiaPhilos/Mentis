import { NextRequest, NextResponse } from 'next/server';
import { encryptCredential, decryptCredential, maskApiKey } from '@/lib/crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const serverHasFallback = Boolean(process.env.GEMINI_API_KEY);

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('user_ai_credentials')
          .select('provider, key_fingerprint, model_preference, updated_at')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          return NextResponse.json({
            hasKey: true,
            maskedKey: data.key_fingerprint,
            provider: data.provider,
            modelPreference: data.model_preference,
            serverHasFallback,
            isConfigured: true,
          });
        }
      }
    }

    return NextResponse.json({
      hasKey: false,
      maskedKey: '',
      provider: 'google',
      serverHasFallback,
      isConfigured: serverHasFallback,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to query credential vault',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider = 'google', apiKey, model = 'gemini-3.8-flash', magicSpell } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'A valid API key string is required for encryption.' },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();
    const encrypted = encryptCredential(trimmedKey);
    const masked = maskApiKey(trimmedKey);

    // If user is authenticated with Supabase, store in user_ai_credentials
    const supabase = await createServerSupabaseClient();
    let databaseStored = false;

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from('user_ai_credentials').upsert(
          {
            user_id: user.id,
            provider,
            encrypted_key: encrypted,
            key_fingerprint: masked,
            model_preference: model,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (!error) {
          databaseStored = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      maskedKey: masked,
      encryptedKey: encrypted,
      provider,
      model,
      magicSpell,
      databaseStored,
      message: '✨ Magical key encrypted and sealed in the sanctuary vault.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Encryption failed',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('user_ai_credentials').delete().eq('user_id', user.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Magical key removed from vault. AI tutors returned to dormant state.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to revoke key',
      },
      { status: 500 }
    );
  }
}
