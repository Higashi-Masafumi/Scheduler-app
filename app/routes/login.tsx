import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { type ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigate, useLoaderData, NavLink, useSubmit } from "@remix-run/react";
import { signIn } from "../db/server.user";
import { getSession, commitSession } from "~/sessions";
import {
    Avatar,
    AvatarImage
} from "~/components/ui/avatar";
import { useState } from "react";
import { Skeleton } from "../components/ui/skeleton";

// Zod schemaの定義
const formSchema = z.object({
    email: z.string()
        .min(1, { message: "メールアドレスを入力してください" })
        .email("有効なメールアドレスを入力してください"),
    password: z.string()
        .min(8, { message: "パスワードは8文字以上である必要があります" }),
});

export async function loader() {
    return {
        env: {
            SUPABASE_URL: process.env.VITE_SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
            APP_URL: process.env.VITE_APP_URL,
        }
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const headers = new Headers()
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
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const id = user.id as string;
        const session = await getSession(request.headers.get("Cookie"));
        // sessionにユーザーIDを保存
        session.set("userId", id);
        // cookieにセッションを保存
        return redirect("/events",
            {
                headers: {
                    "Set-Cookie": await commitSession(session),
                }
            }
        );
    }
    // ログインに失敗した場合はログイン画面にリダイレクト
    redirect("/login");
}

// TypeScript用のフォームデータの型定義
type FormData = z.infer<typeof formSchema>;


export default function Login() {
    // React Hook Formのセットアップ
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { env } = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const [loading, setLoading] = useState(false);

    // フォームの送信処理
    async function onSubmit(formData: FormData) {
        setLoading(true);
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // Supabaseの認証情報を使ってログイン
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });
        if (error) {
            form.setError("password", { message: error.message });
        }
        else {
            submit(formData, { method: "post" });
        }
        setLoading(false);
    }

    // Googleアカウントでログイン、リダイレクト先でセッションを設定
    async function signInWithGoogle() {
        setLoading(true);
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        const google = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${env.APP_URL}/auth/callback`,
            }
        })
    }


    return (
        <Form {...form}>
            <Card className="w-full max-w-md mx-auto my-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
                    <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* フォーム全体の構築 */}
                    {loading ? (
                        <div className="w-full max-w-md">
                            <div className="flex flex-col space-y-3">
                                <Skeleton className="h-[250px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>メールアドレス</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="shadcn@gmail.com"
                                                {...field}
                                                className={form.formState.errors.email ? 'border-red-500' : ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            メールアドレスを入力してください
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>パスワード</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">ログイン</Button>
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center py-2"
                                onClick={signInWithGoogle}
                            >
                                <Avatar className="py-2 mr-2">
                                    <AvatarImage src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google logo" style={{ height: '24px', width: '24px' }} />
                                </Avatar>
                                <span>Googleでログイン</span>
                            </Button>
                            <NavLink to="/signup" className="text-center block text-blue-500">
                                <Button variant="secondary" className="w-full">
                                    アカウントを作成する
                                </Button>
                            </NavLink>
                            {/*パスワードのリセットページへのリンク*/}
                            <NavLink to="/reset-password" className="text-center block text-blue-500">
                                パスワードを忘れた場合
                            </NavLink>
                        </form>
                    )}
                </CardContent>
            </Card>
        </Form>
    );
}
