import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { useActionData, useLoaderData, useSubmit, redirect } from '@remix-run/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunction, ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Textarea } from '~/components/ui/textarea';
import { getSession, commitSession } from '~/sessions';
import { getUser, updateUser } from '~/db/server.user';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "~/components/ui/avatar";
import { ToastAction } from "~/components/ui/toast"
import { useToast } from "~/components/ui/use-toast"


// Zod schemaの定義
const formSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    console.log('session', user);
    // ユーザーがログインしていない場合はログイン画面にリダイレクト
    if (!user) {
        console.log(session);
        return redirect('/login');
    }
    const userData = await getUser(user);
    const env = {
        SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
        SUPABASE_STORAGE_BUCKET: process.env.VITE_SUPABASE_STORAGE_BUCKET!,
    };
    return { userData, env };
}

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const headers = new Headers()
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatar = formData.get('avatar') as string;
    const updateData : {name?: string, bio?: string, imageurl?: string} = {};
    if (name) {
        updateData.name = name;
    }
    if (bio) {
        updateData.bio = bio;
    }
    if (avatar) {
        updateData.imageurl = avatar;
    }
    console.log('updateData', updateData);
    const updatedUser = await updateUser(user, updateData);
    if (!updatedUser) {
        return redirect('/profile');
    }
    return redirect('/events');
};

type FormData = z.infer<typeof formSchema>;

export default function Profile() {

    const { userData } = useLoaderData<typeof loader>();
    const { env } = useLoaderData<typeof loader>();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bio: "",
        },
    });
    const { toast } = useToast();
    const submit = useSubmit();
    const [previewImage, setPreviewImage] = useState(userData?.imageurl ?? '');
    const fileInput = useRef<HTMLInputElement | null>(null);

    async function onSubmit(formData: FormData) {
        const data = new FormData();
        formData.name && data.append('name', formData.name);
        formData.bio && data.append('bio', formData.bio);
        formData.avatar && data.append('avatar', formData.avatar);
        submit(data, { method: 'post' });
    }

    async function handleAvatarChange() {
        const file = fileInput.current?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            const supabase = createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
            console.log(file);
            console.log(file.name);
            const { data, error } = await supabase.storage.from('images').upload(`${userData?.id}/${file.name}`, file, {upsert: true});
            console.log(data);
            console.log(error);
            if (error) {
                toast({
                    title: 'エラー',
                    description: '画像のアップロードに失敗しました',
                    action: <ToastAction altText="閉じる">閉じる</ToastAction>
                });
                return;
            }
            toast({
                title: '成功',
                description: '画像をアップロードしました',
                action: <ToastAction altText="閉じる">閉じる</ToastAction>
            });
            // 成功した場合は公開URLを取得
            const { data: publicUrl } = await supabase.storage.from('images').getPublicUrl(`${userData?.id}/${file.name}`);
            console.log(publicUrl);
            // 公開URLをデータベースに保存
            form.setValue('avatar', publicUrl.publicUrl);
        }
    }

    return (
        <Form {...form}>
            <div className="space-y-10 px-5 py-5">
                <div className="flex justify-between pt-5">
                    <h1 className="text-3xl font-bold">プロフィール編集画面</h1>
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="grid-cols-2 whitespace-normal">
                                <Avatar
                                    className="w-20 h-20"
                                    onClick={() => fileInput.current?.click()}
                                >
                                    <AvatarImage src={previewImage} />
                                    <AvatarFallback>{userData?.name}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm place-items-center">画像を変更</span>
                                <Input type="file" ref={fileInput} onChange={handleAvatarChange} className="hidden" />
                            </div>
                            <div className="grid-cols-2 gap-2">
                                <CardTitle>{userData?.name}</CardTitle>
                                <CardDescription>{userData?.bio}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-4 py-3">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>名前</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="山田　太郎" />
                                            </FormControl>
                                            <FormDescription>新しい名前を入力してください</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4 py-5">
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>自己紹介</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="大学一年生です。よろしくお願いします。" />
                                            </FormControl>
                                            <FormDescription>自己紹介を入力してください</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">プロフィール情報を保存</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Form>
    );
}



