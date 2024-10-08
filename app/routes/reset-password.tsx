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
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { Mail, Send } from "lucide-react";

// Zod schemaの定義
const formSchema = z.object({
    email: z.string()
        .min(1, { message: "メールアドレスを入力してください" })
        .email("有効なメールアドレスを入力してください"),
});

export async function loader() {
    return {
        env: {
            SUPABASE_URL: process.env.VITE_SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
        }
    }
}

// TypeScript用のフォームデータの型定義
type FormData = z.infer<typeof formSchema>;


export default function ResetPassword() {
    // React Hook Formのセットアップ
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const { env } = useLoaderData<typeof loader>();
    const [loading, setLoading] = useState(false);

    // フォームの送信処理
    async function onSubmit(formData: FormData) {
        setLoading(true);
        const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // Supabaseの認証情報を使ってログイン
        const { data, error } = await supabase.auth.resetPasswordForEmail(formData.email,
            {
                redirectTo: `${window.location.origin}/change-password`,
            });
        if (error) {
            setLoading(false);
            form.setError("email", { message: error.message });
            return;
        }
    }

    return (
        loading ? (
            <Card className="w-full max-w-md mx-auto my-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">パスワードのリセット</CardTitle>
                    <CardDescription>
                        パスワードリセットメールを送信しました。メールボックスを確認してください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <Send className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="text-center mt-4">
                        メールを確認できない場合は、迷惑メールフォルダをご確認ください
                    </div>
                </CardContent>
            </Card>
        ) : (
            <Form {...form}>
                <Card className="w-full max-w-md mx-auto my-10">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">パスワードのリセット</CardTitle>
                        <CardDescription>アカウント登録時のメールアドレスを入力してください</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                            <Button type="submit" className="w-full">
                                <Mail className="w-5 h-5 mr-2" />
                                パスワードリセットメールを送信
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Form>
        )
    );
}
