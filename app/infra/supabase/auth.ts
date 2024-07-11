import { createServerClient, parse, serialize } from "@supabase/ssr";


export const createServerSupabaseClient = (request: Request) => {
  const cookies = parse(request.headers.get('Cookie') ?? '')
  const headers = new Headers()
  const supabase = createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key]
        },
        set(key, value, options) {
          headers.append('Set-Cookie', serialize(key, value, options))
        },
        remove(key, options) {
          headers.append('Set-Cookie', serialize(key, '', options))
        },
      },
    },
  )
  return { supabase, headers }
}
