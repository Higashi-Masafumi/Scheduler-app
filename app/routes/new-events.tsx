import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSubmit } from '@remix-run/react';
import { getSession } from '~/sessions';
import { redirect } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useState } from 'react';

// Zod schemaの定義
const formSchema = z.object({
    title: z.string().min(3, { message: 'イベントのタイトルを入力してください' }),
    description: z.string().min(0, { message: 'イベントの説明を入力してください' }),
    candidates: z.array(z.string()).nonempty({ message: '候補日時を入力してください' }),
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

// イベント作成ページ
export default function NewEvents() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            candidates: [],
        },
    });

    const [candidates, setCandidates] = useState<string[]>([]);

    const submit = useSubmit();

    const onSubmit = async (data: FormData) => {
        const formDataWithCandidates = { ...data, candidates };
        await submit(formDataWithCandidates, { method: 'post' });
    };

    return (
        <Form {...form}>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">イベント作成</h1>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>イベントのタイトル</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                        <FormMessage />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>イベントの説明</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                        <FormMessage />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Label>候補日時</Label>
                        <Input
                            type="datetime-local"
                            onChange={(e) => setCandidates([...candidates, e.target.value])}
                        />
                        <Button type="button" onClick={() => setCandidates([...candidates, ''])}>追加</Button>
                    </div>
                    <div className="space-y-2">
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
            </div >
        </Form >
    );
}
