import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSubmit } from '@remix-run/react';
import { getSession } from '~/sessions';
import { redirect } from '@remix-run/react';
import { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useState } from 'react';
import { createEvent } from '~/db/server.event';

// Zod schemaの定義
const formSchema = z.object({
    title: z.string().min(3, { message: 'イベントのタイトルを入力してください' }),
    description: z.string().min(0, { message: 'イベントの説明を入力してください' })
});

type FormData = z.infer<typeof formSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    if (!user) {
        return redirect('/login');
    }
    return { user };
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    const formData = await request.formData();
    console.log(formData);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const candidates: string[] = (formData.getAll('candidates') as string[]).flatMap(candidate =>
        candidate.split(',').map(date => new Date(date).toISOString()) // Convert Date to string
    );
    console.log(candidates);
    const newevent = await createEvent(user, { title, description, candidates });
    if (newevent) {
        return redirect('/events');
    }
}

// イベント作成ページ
export default function NewEvents() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const [candidates, setCandidates] = useState<string[]>([]);

    const submit = useSubmit();

    async function onSubmit(formData: FormData) {
        const formDataWithCandidates = { ...formData, candidates };
        console.log(formDataWithCandidates);
        await submit(formDataWithCandidates, { method: 'post' });
    };

    return (
        <Form {...form}>
            <div className="space-y-6 py-10 px-10">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-wide md:text-3xl">イベント作成</h1>
                </div>
                <div className="space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 my-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>タイトル</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-4 my-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>説明</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex items-center space-y-4 my-4">
                            <Label className="whitespace-nowrap mr-3">候補日時</Label>
                            <Input
                                type="datetime-local"
                                onChange={(e) => setCandidates([...candidates, e.target.value])}
                                className="flex-grow max-w-xs"
                            />
                            <Button type="button" onClick={() => setCandidates([...candidates, ''])}
                                className="ml-4">追加</Button>
                        </div>
                        <div className="space-y-2 my-4">
                            <Label>候補日時一覧</Label>
                            <ul className="space-y-2">
                                {candidates.map((candidate, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <Input
                                            type="datetime-local"
                                            value={candidate}
                                            onChange={(e) => {
                                                const newCandidates = [...candidates];
                                                newCandidates[index] = e.target.value;
                                                setCandidates(newCandidates);
                                            }}
                                            className="flex-grow max-w-xs"
                                        />
                                        <Button type="button" onClick={() => {
                                            const newCandidates = [...candidates];
                                            newCandidates.splice(index, 1);
                                            setCandidates(newCandidates);
                                        }}>削除</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button type="submit">作成</Button>
                    </form>
                </div>
            </div >
        </Form >
    );
}
