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
import { useSubmit } from '@remix-run/react';
import { getSession } from '~/sessions';
import { redirect } from '@remix-run/react';
import { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useState } from 'react';
import { createEvent } from '~/db/server.event';
import { Datepicker, localeJa, setOptions } from "@mobiscroll/react";
import '@mobiscroll/react/dist/css/mobiscroll.min.css';

setOptions({
    theme: 'ios',
    themeVariant: 'light'
});

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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const candidates: string[] = (formData.getAll('candidates') as string[]).flatMap(candidate =>
        candidate.split(',').map(date => new Date(date).toISOString()) // Convert Date to string
    );
    const newevent = await createEvent(user, { title, description, candidates });
    if (newevent) {
        return redirect(`/events/${newevent.id}`);
    }
    return redirect('/new-events');
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
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const submit = useSubmit();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const formDataWithCandidates = { ...formData, candidates };
        // 候補日時を選択していない場合はエラーを表示
        if (candidates.length === 0) {
            setLoading(false);
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
                setLoading(false);
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
                    <h1 className="text-3xl font-bold tracking-wide md:text-3xl">新規イベント作成</h1>
                    <p className="text-gray-500">
                        イベントのタイトルと説明、イベントの開始日時を選択してください
                    </p>
                </div>
                <div className="space-y-3">
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
                        <div className="flex-col space-y-4 my-4">
                            <Label className="whitespace-nowrap mr-3">候補日程を選択して追加</Label>
                            <Datepicker
                                locale={localeJa}
                                responsive={{
                                    xsmall: {
                                        controls: ['datetime'],
                                        display: "center",
                                        touchUi: true
                                    },
                                    small: {
                                        controls: ['calendar', 'time'],
                                        display: "top",
                                        touchUi: true
                                    },
                                    custom: {
                                        breakpoint: 600,
                                        controls: ['calendar', 'time'],
                                        display: "top",
                                        touchUi: false
                                    }
                                }}
                                value={selectedDate ? new Date(selectedDate) : null}
                                inputComponent="input"
                                inputProps={{
                                    placeholder: '日時を選択',
                                    className: "border rounded-md p-2", // Added the missing comma here
                                }}
                                onChange={(event) => {
                                    if (event && event.value) {
                                        setSelectedDate(event.value.toString());
                                        setCandidates([...candidates, new Date(String(event.value)).toISOString()]);
                                        setSelectedDate(null);
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2 my-4">
                            <Label>選択済み候補日程一覧</Label>
                            <ul className="space-y-2">
                                {candidates.map((candidate, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <Datepicker
                                            locale={localeJa}
                                            responsive={{
                                                xsmall: {
                                                    controls: ['datetime'],
                                                    display: "center",
                                                    touchUi: true
                                                },
                                                small: {
                                                    controls: ['calendar', 'time'],
                                                    display: "center",
                                                    touchUi: true
                                                },
                                                custom: {
                                                    breakpoint: 600,
                                                    controls: ['calendar', 'time'],
                                                    display: "top",
                                                    touchUi: true
                                                }
                                            }}
                                            inputComponent="input"
                                            inputProps={{
                                                placeholder: '日時を選択',
                                                className: "border rounded-md p-2"
                                            }}
                                            value={new Date(candidate)}
                                            onChange={(event) => {
                                                if (event && event.value) {
                                                    const newCandidates = [...candidates];
                                                    newCandidates[index] = new Date(String(event.value)).toISOString();
                                                    // 候補日程をソートしておく
                                                    newCandidates.sort();
                                                    setCandidates(newCandidates);
                                                }
                                            }}
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
                        {loading ? (
                            <Button disabled type="submit">イベントを作成中</Button>
                        ) : (
                            <Button type="submit">イベントを作成</Button>
                        )}
                    </form>
                </div>
            </div >
        </Form >
    );
}
