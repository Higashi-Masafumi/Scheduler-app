import { useLoaderData, redirect, useSubmit } from '@remix-run/react';
import { getSession } from '~/sessions';
import { LoaderFunctionArgs } from '@remix-run/node';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from '~/components/data-table';
import { Button } from "../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from "../components/ui/label";
import { getEvent } from '~/db/server.event';
import { participateinEvent } from '~/db/server.user';
import { updateAbscence } from '~/db/server.event';
import {
    FormField,
    FormItem,
    FormMessage,
    Form,
    FormControl,
    FormDescription,
    FormLabel,
} from "../components/ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "../components/ui/tooltip";
import { Input } from "../components/ui/input";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "~/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";

import { getChat, postChat } from '~/db/server.chat';



// Zod schemaの定義
const formSchema = z.object({
    abscence: z.array(z.string().min(0, { message: '出席情報を入力してください' })),
    remarks: z.string().min(0, { message: '備考を入力してください' }),
});
const chatSchema = z.object({
    message: z.string().min(1, { message: 'メッセージを入力してください' }),
});

type FormData = z.infer<typeof formSchema>;
type ChatData = z.infer<typeof chatSchema>;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    if (!userId) {
        return redirect('/login');
    }
    const eventId = params.eventId;
    // イベントが存在するか確認して、存在する場合で参加していない時に参加する
    const res = await participateinEvent(userId, Number(eventId));
    // イベントが見つからなかった場合、エラーを返す
    if (res === "event not found") {
        throw new Response("Event not found", { status: 500 });
    }
    const event = await getEvent(Number(eventId));
    const chat = await getChat(Number(eventId));
    return { event, userId };
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const formData = await request.formData();
    const participantId = Number(formData.get('participantId'));
    const abscence = JSON.parse(formData.get('abscence') as string);
    const remarks = formData.get('remarks') as string;
    await updateAbscence(participantId, abscence, remarks);
    return redirect('/events');
}

type Participant = {
    id: number;
    userId: string;
    name: string;
    imageurl: string;
    remarks: string;
    abscence: string[];
}

export default function EventTable() {
    const { event, userId } = useLoaderData<typeof loader>();
    const participants = event.participants as Participant[];
    const user = participants.find(participant => participant.userId === userId);
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            abscence: user?.abscence ?? [],
            remarks: user?.remarks ?? '',
        },
    });
    const submit = useSubmit();

    function formatCandidateDate(candidate: string): string {
        const date = new Date(candidate);

        // 日本語ロケールでの曜日を含む日付のフォーマット
        const formattedDate = date.toLocaleDateString('ja-JP', {
            month: 'long',   // "8月"
            day: 'numeric',  // "16日"
            weekday: 'short' // "(木)"
        });

        // 時間のフォーマット
        const formattedTime = date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24時間表記
        });

        // 最終的なフォーマットの組み合わせ
        return `${formattedDate}\n ${formattedTime}~`;
    }


    async function onSubmit(data: FormData) {
        const formData = new FormData();
        console.log(data);
        formData.append('participantId', String(user?.id));
        formData.append('abscence', JSON.stringify(data.abscence));
        formData.append('remarks', data.remarks);
        submit(formData, { method: 'POST' });
    }

    const columns: ColumnDef<Participant>[] = [
        {
            accessorKey: "name",
            header: "名前",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={row.original.imageurl} alt={row.original.name} />
                            <AvatarFallback>{row.original.name}</AvatarFallback>
                        </Avatar>
                        <span>{row.original.name}</span>
                    </div>
                );
            },
        },
        ...(event.candidates ?? []).map((candidate, index) => ({
            accessorKey: `absence.${index}`,
            header: () => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" variant="link">
                                {formatCandidateDate(candidate)}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <h3>出席可能な参加者</h3>
                            {participants.filter(participant => participant.abscence[index] === '出席').map(participant => (
                                <p key={participant.id}>{participant.name}</p>
                            ))}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
            cell: ({ row }: { row: { original: Participant } }) => {
                const participant = row.original;
                // 自分自身の行のみ編集可能
                if (participant.userId == userId) {
                    return (
                        <FormField
                            control={form.control}
                            name={`abscence.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="選択してください" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <FormMessage />
                                        <SelectContent>
                                            <SelectItem value="出席">出席</SelectItem>
                                            <SelectItem value="欠席">欠席</SelectItem>
                                            <SelectItem value="未定">未定</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    );
                }
                else {
                    return <span>{participant.abscence[index] ?? "未選択"}</span>
                }
            },
        })),
        {
            accessorKey: "remarks",
            header: () => <span className="min-w-80">備考</span>,
            cell: ({ row }) => {
                const participant = row.original;
                if (participant.userId == userId) {
                    return (
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} className="min-w-80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    );
                }
                else {
                    return <span>{participant.remarks}</span>
                }
            }
        }
    ];


    return (
        <div className="container mx-auto py-10 px-5">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold">{event.title}</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>このイベントに関するチャット</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>チャット</SheetTitle>
                        </SheetHeader>
                        <SheetContent>
                            <ScrollArea className="h-96">

                            </ScrollArea>
                        </SheetContent>
                        <SheetFooter>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="mb-8">
                <p className="text-gray-600 text-lg">{event.description}</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <ScrollArea className="mx-auto w-auto">
                        <DataTable columns={columns} data={participants} />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <Button type="submit" className="mt-8">出席情報を更新する</Button>
                </form>
            </Form>
        </div>
    );
}