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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";

// Zod schemaの定義
const formSchema = z.object({
    name: z.string().min(1, { message: '名前を入力してください' }),
    bio: z.string().min(0, { message: '自己紹介を入力してください' }),
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
    return userData;
}

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    await updateUser(user, { name, bio });
    return redirect('/');
};

type FormData = z.infer<typeof formSchema>;
type userData = {
    name: string;
    bio: string;
};

export default function Profile() {

    const userData: userData = useLoaderData();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bio: "",
        },
    });
    const submit = useSubmit();
    const actionData = useActionData();

    async function onSubmit(formData: FormData) {
        submit(formData, { method: 'post' });
    }
    return (
        <Form {...form}>
            <div className="space-y-10 px-5 py-5">
                <div className="flex justify-between pt-5">
                    <h1 className="text-4xl font-bold">プロフィール編集画面</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{userData.name}</CardTitle>
                        <CardDescription>{userData.bio}</CardDescription>
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
                            <Button type="submit">保存</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Form>
    );
}


