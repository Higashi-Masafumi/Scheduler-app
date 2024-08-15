import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { signUp } from '~/db/server.user'
import { getSession, commitSession } from '~/sessions'

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const headers = new Headers()

  if (code) {
    const supabase = createServerClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        if(user) {
            // 新規ユーザー登録
            const id = user.id as string;
            const email = user.email as string;
            const name = user.user_metadata?.full_name as string;
            const imageurl = user.user_metadata?.avatar_url as string;
            console.log("user", user);
            const newuser = await signUp(id, email, name, imageurl);
            if (newuser) {
                const session = await getSession(request.headers.get('Cookie'));
                session.set('userId', id);
                return redirect("/events", {
                    headers: {
                        "Set-Cookie": await commitSession(session),
                }
            });
            }
        }
    }
  }
  // return the user to an error page with instructions
  throw new Response('Error signing in', { status: 500 })
}