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
import { createBrowserClient } from "@supabase/ssr"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigate, useLoaderData, useSubmit, NavLink } from "@remix-run/react";
import { signUp } from "../db/server.user";
import { commitSession, getSession } from "~/sessions";

// Zod schemaの定義
const formSchema = z.object({
    email: z.string()
        .min(1, { message: "メールアドレスを入力してください" })
        .email("有効なメールアドレスを入力してください"),
    password: z.string()
        .min(8, { message: "パスワードは8文字以上である必要があります" }),
});

export async function loader({request}: LoaderFunctionArgs) {
    // ログインしている場合はホーム画面にリダイレクト
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    if (userId) {
        return redirect('/');
    }
    return { env: {
        SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    }};
}

export async function action({ request }: ActionFunctionArgs) {
    // serverサイドの処理
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // サインアップ
    const user = await signUp(email, password);
    // サインアップに成功したらホーム画面にリダイレクト
    if (user) {
        const session = await getSession(request.headers.get("Cookie"));
        // sessionにユーザーIDを保存
        session.set("userId", user.id);

        // cookieにセッションを保存
        return redirect("/",
            {
                headers: {
                    "Set-Cookie": await commitSession(session),
                }
            });
    }
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

    const submit = useSubmit();
    const { env } = useLoaderData<typeof loader>();

    async function onSubmit(formData: FormData) {
        // supabaseのクライアントを作成
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // サインアップ
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });
        // エラーがある場合はエラーメッセージを表示
        if (error) {
            form.setError('password', {
                type: 'manual',
                message: error.message,
            });
        }
        // サインアップに成功したらaction関数にデータを渡す
        if (!error) {
            submit( formData, { method: 'post' });
        }
    }

    return (
        <Form {...form}>
            <Card className="w-full max-w-md mx-auto my-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">サインアップ</CardTitle>
                    <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* フォーム全体の構築 */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
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
                        <Button type="submit" className="w-full">サインアップ</Button>
                        <NavLink to="/login" className="text-center block mt-4">
                            <Button variant="secondary" className="w-full">
                                すでにアカウントをお持ちの方
                            </Button>
                        </NavLink>
                    </form>
                </CardContent>
            </Card>
        </Form>
    );
}
