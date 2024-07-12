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
import { createClient } from "@supabase/supabase-js";
import { type ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { createServerSupabaseClient } from "../infra/supabase/auth";
import { useActionData, useNavigate, useLoaderData } from "@remix-run/react";
import React from "react";

// Zod schemaの定義
const formSchema = z.object({
    email: z.string()
        .min(1, { message: "メールアドレスを入力してください" })
        .email("有効なメールアドレスを入力してください"),
    password: z.string()
        .min(8, { message: "パスワードは8文字以上である必要があります" }),
});

export async function loader() {
    return { env : {
        SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    }}
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { supabase, headers } = await createServerSupabaseClient(request);

    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    console.log(error);

    if (error) {
        return json({ error: error.message }, { status: 400 });
    }
    // signupに成功したらホーム画面にリダイレクト
    return redirect("/");
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

    const actionData = useActionData<{ error?: string }>();
    const navigate = useNavigate();
    const { env } = useLoaderData<typeof loader>();


    // フォームの送信処理
    async function onSubmit(formData: FormData) {
        const supabase = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
        // Supabaseにユーザーを登録
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });
        console.log(formData)
        console.log(data);

        if (error) {
            form.setError("password", { message: error.message });
        }
        else {
            // 登録に成功したらリダイレクト
            navigate("/");
        }
    }


    return (
        <Form {...form}>
            <Card className="w-full max-w-md mx-auto">
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
                                    <FormMessage/>
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
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">サインアップ</Button>
                        <Button variant="outline" className="w-full">Googleでサインアップ</Button>
                    </form>
                </CardContent>
            </Card>
        </Form>
    );
}
