import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { createServerClient, parseCookieHeader, serializeCookieHeader, createBrowserClient } from '@supabase/ssr'
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { ActionFunctionArgs } from "@remix-run/node";
import { getSession, commitSession } from "~/sessions";

// Zod schemaの定義
const formSchema = z.object({
    password: z.string()
        .min(8, { message: "パスワードは8文字以上である必要があります" }),
});

export async function loader() {
    return {
        env: {
            SUPABASE_URL: process.env.VITE_SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
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
        // sessionを作成
        const session = await getSession(request.headers.get('Cookie'));
        session.set('userId', user.id as string);
        return redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session),
            }
        });
    }
    redirect("/login");
}

// TypeScript用のフォームデータの型定義
type FormData = z.infer<typeof formSchema>;


export default function ChangePassword() {
    // React Hook Formのセットアップ
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    });
    const [loading, setLoading] = useState(false);
    const submit = useSubmit();
    const { env } = useLoaderData<typeof loader>();

    // フォームの送信処理
    async function onSubmit(formData: FormData) {
        setLoading(true);
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // Supabaseの認証情報を使ってログイン
        const { data, error } = await supabase.auth.updateUser({
            password: formData.password,
        });
        if (error) {
            setLoading(false);
            return;
        }
        submit(formData, { method: "post" });
    }
    return (
        <Form {...form}>
            <Card className="w-full max-w-md mx-auto my-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">パスワードのリセット</CardTitle>
                    <CardDescription>新しいパスワードを入力してください</CardDescription>
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
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
                            <Button type="submit" className="w-full">パスワードをリセット</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </Form>
    );
}
