import { createServerSupabaseClient } from '@/lib/supabase/server';
import { decryptCredential } from '@/lib/crypto';

/**
 * Server-side helper used by AI route handlers (/api/ai/chat, /api/ai/summarize)
 * to securely resolve the decrypted key without client exposure.
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
