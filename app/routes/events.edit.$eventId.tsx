import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { useToast } from '~/components/ui/use-toast';
import { ToastAction } from '~/components/ui/toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSubmit, useLoaderData } from '@remix-run/react';
import { getSession } from '~/sessions';
import { redirect } from '@remix-run/react';
import { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useState, useRef } from 'react';
import { getEvent } from '~/db/server.event';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
}   from '~/components/ui/alert-dialog';
import { updateEvent } from '~/db/server.event';

// Zod schemaの定義
const formSchema = z.object({
    title: z.string().min(3, { message: 'イベントのタイトルを入力してください' }),
    description: z.string().min(0, { message: 'イベントの説明を入力してください' })
});

type FormData = z.infer<typeof formSchema>;

export async function loader({ request, params }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    if (!user) {
        return redirect('/login');
    }
    const eventId = Number(params.eventId);
    const event = await getEvent(eventId);
    return { event };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const user = session.get('userId');
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const candidates: string[] = (formData.getAll('candidates') as string[]).flatMap(candidate =>
        candidate.split(',').map(date => new Date(date).toISOString()) // Convert Date to string
    );
    const eventId = Number(params.eventId);
    const newevent = await updateEvent(eventId, { title, description, candidates });
    if (newevent) {
        return redirect(`/events/${eventId}`);
    }
    return redirect('.');
}

// イベント編集画面
export default function EditEvents() {
    const { event } = useLoaderData<typeof loader>();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event.title,
            description: event.description || '',
        },
    });

    // データベースからの候補日時をフォーマットして表示
    const [candidates, setCandidates] = useState<string[]>(event.candidates?.map(candidate => new Date(candidate).toISOString().split('.')[0]) ?? []);
    const { toast } = useToast();
    const submit = useSubmit();
    const formRef = useRef(null);


    async function onSubmit(formData: FormData) {
        const formDataWithCandidates = { ...formData, candidates };
        // 候補日時を選択していない場合はエラーを表示
        if (candidates.length === 0) {
            toast({
                title: '候補日時が選択されていません',
                description: '候補日時を選択してください',
                action: <ToastAction altText="閉じる">閉じる</ToastAction>
            });
            return;
        }
        // 候補日時が未指定の場合はエラーを表示
        for (const candidate of candidates) {
            const date = new Date(candidate);
            if (isNaN(date.getTime())) {
                toast({
                    title: '日時未指定の候補日時があります',
                    description: '候補日時を指定してください',
                    action: <ToastAction altText="閉じる">閉じる</ToastAction>
                });
                return;
            }
        }
        // 候補日程をソートしておく
        candidates.sort();
        await submit(formDataWithCandidates, { method: 'post' });
    };

    return (
        <Form {...form}>
            <div className="space-y-6 py-10 px-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-wide md:text-3xl">イベント編集</h1>
                    <h2 className="text-xl text-red-600">イベント情報の編集を行い<br/>更新を行うと参加者の出席状況が<br/>全てリセットされます</h2>
                </div>
                <div className="space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} id="eventreset">
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
                            <Label className="whitespace-nowrap mr-3">候補日程を追加</Label>
                            <Input
                                type="datetime-local"
                                onChange={(e) => setCandidates([...candidates, e.target.value])}
                                className="flex-grow max-w-xs mr-2"
                            />
                            <Button type="button"
                                onClick={() => setCandidates([...candidates, ''])}
                                className="px-4">
                                追加
                            </Button>
                        </div>
                        <div className="space-y-2 my-4">
                            <Label>現在の候補日程一覧</Label>
                            <ul className="space-y-2">
                                {candidates.map((candidate, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <Input
                                            type="datetime-local"
                                            value={candidate}
                                            onChange={(e) => {
                                                const newCandidates = [...candidates];
                                                newCandidates[index] = e.target.value;
                                                // 候補日時をソートしておく
                                                newCandidates.sort();
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
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button type="button" className="w-full" variant="destructive">イベント情報を更新する</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>イベント情報を更新しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        この操作により、参加者の出席状況がリセットされます。本当に更新しますか？
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction type="submit" form="eventreset">更新</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </form>
                </div>
            </div >
        </Form >
    );
}
