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

/**
 * Server-side helper used by /api/ai/chat and /api/ai/summarize to securely resolve the decrypted key.
 */
export async function resolveDecryptedApiKey(params: {
  encryptedKey?: string;
  userApiKey?: never; // Strictly prohibited by Step 5
}): Promise<{ apiKey: string | null; provider: string; source: 'user_vault' | 'server_env' | 'none' }> {
  // 1. Try Supabase session vault if available
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('user_ai_credentials')
          .select('encrypted_key, provider')
          .eq('user_id', user.id)
          .single();

        if (data?.encrypted_key) {
          const decrypted = decryptCredential(data.encrypted_key);
          return { apiKey: decrypted, provider: data.provider || 'google', source: 'user_vault' };
        }
      }
    }
  } catch {
    // Continue to payload check
  }

  // 2. Decrypt client-provided AES-256-GCM ciphertext from local repository vault
  if (params.encryptedKey && typeof params.encryptedKey === 'string' && params.encryptedKey.includes(':')) {
    try {
      const decrypted = decryptCredential(params.encryptedKey);
      return { apiKey: decrypted, provider: 'google', source: 'user_vault' };
    } catch {
      // Malformed or different server key
    }
  }

  // 3. Fallback to server-side GEMINI_API_KEY if configured
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return { apiKey: process.env.GEMINI_API_KEY.trim(), provider: 'google', source: 'server_env' };
  }

  return { apiKey: null, provider: 'google', source: 'none' };
}
