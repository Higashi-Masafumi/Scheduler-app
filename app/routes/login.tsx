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
import { createBrowserClient } from "@supabase/ssr";
import { type ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigate, useLoaderData, NavLink, useSubmit } from "@remix-run/react";
import { signIn } from "../db/server.user";
import { getSession, commitSession } from "~/sessions";

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
        }
    }
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // signupに成功したらホーム画面にリダイレクト
    const user = await signIn(email, password);
    console.log(user);
    if (user) {
        const session = await getSession(request.headers.get("Cookie"));
        // sessionにユーザーIDを保存
        session.set("userId", user.id);

        console.log("Session data", session.data);
        // cookieにセッションを保存
        return redirect("/",
            {
                headers: {
                    "Set-Cookie": await commitSession(session),
                }
            }
        );
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

    const { env } = useLoaderData<typeof loader>();
    const submit = useSubmit();

    // フォームの送信処理
    async function onSubmit(formData: FormData) {
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // Supabaseにユーザーを登録
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
    }

    // Googleアカウントでログイン
    async function signInWithGoogle() {
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        const google = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:5173/",
            }
        })
        if (!google) {
            console.log("Google login failed");
        }
        console.log(google);
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
                        <Button type="submit" className="w-full">ログイン</Button>
                        <Button
                            type="button"
                            onClick={signInWithGoogle}
                            className="w-full bg-red-500"
                        >
                            Googleアカウントでログイン
                        </Button>
                        <NavLink to="/signup" className="text-center block text-blue-500">
                            <Button variant="secondary" className="w-full">
                                アカウントを作成する
                            </Button>
                        </NavLink>
                    </form>
                </CardContent>
            </Card>
        </Form>
    );
}
