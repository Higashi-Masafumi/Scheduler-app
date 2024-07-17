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
    bio: z.string().min(1, { message: '自己紹介を入力してください' }),
});

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');

    console.log('session', user);
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
    return redirect('/profile');
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
            name: userData.name,
            bio: userData.bio,
        },
    });
    const submit = useSubmit();
    const actionData = useActionData();

    async function onSubmit(formData: FormData) {
        submit(formData, { method: 'post' });
    }
    return (
        <Form {...form}>
            <div className="px-4 space-y-10 py-5 sm:px-6">
                <header className="flex items-center space-x-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">{userData.name}</h1>
                    </div>
                </header>
            </div>
            <div className="space-y-10 py-4">
                <Card>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>名前</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>新しい名前を入力してください</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>自己紹介</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormDescription>自己紹介を入力してください</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">保存</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Form>
    );
}


