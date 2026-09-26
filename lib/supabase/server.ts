import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseServerUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

export function getSupabaseServerAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();
}

export function isSupabaseServerConfigured(): boolean {
  const url = getSupabaseServerUrl();
  const key = getSupabaseServerAnonKey();
  return Boolean(url && key && url.length > 0 && key.length > 0);
}

/**
 * Creates an authenticated Supabase server client for Server Components, Server Actions,
 * and Next.js Route Handlers. Integrates with App Router cookies.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const url = getSupabaseServerUrl()!;
  const key = getSupabaseServerAnonKey()!;
  const cookieStore = await cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Invoked from a Server Component where cookies cannot be set directly.
            // Ignored when session middleware refreshes cookies.
          }
        },
      },
    }
  );
}

/**
 * Creates a privileged administrative Supabase client using the service role key.
 * Strictly for server-only backend routes (e.g. initial admin provisioning, privileged webhooks).
 * Returns null if service role key is not configured.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.trim() === '' || serviceKey.trim() === '') {
    return null;
  }

  return createSupabaseJsClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
