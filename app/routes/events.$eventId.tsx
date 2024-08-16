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
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { OtherChatBubble, OwnChatBubble } from "~/components/chat";
import { getChat, postChat } from '~/db/server.chat';
import { createBrowserClient } from '@supabase/ssr';
import { useRevalidator, useNavigate } from '@remix-run/react';
import { ToastAction } from '~/components/ui/toast';
import { useToast } from '~/components/ui/use-toast';
import { useEffect, useState } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '~/components/ui/hover-card';
import { Copy, CopyCheck, Loader2 } from 'lucide-react';

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
        return redirect('/');
    }
    const eventId = Number(params.eventId);
    // イベントが存在するか確認して、存在する場合で参加していない時に参加する
    const res = await participateinEvent(userId, Number(eventId));
    // イベントが見つからなかった場合、エラーを返す
    if (res === "event not found") {
        throw new Response("Event not found", { status: 500 });
    }
    const event = await getEvent(Number(eventId));
    const chat = await getChat(Number(eventId));
    const env = {
        SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
        SUPABASE_STORAGE_BUCKET: process.env.VITE_SUPABASE_STORAGE_BUCKET!,
        APP_URL: new URL(request.url),
    };
    return { event, userId, chat, eventId, env };
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const formData = await request.formData();
    if (formData.get('abscence')) {
        const participantId = Number(formData.get('participantId'));
        const abscence = JSON.parse(formData.get('abscence') as string);
        const remarks = formData.get('remarks') as string;
        const newabscence = await updateAbscence(participantId, abscence, remarks);
        if (newabscence) {
            return redirect(`/events/participate`);
        }
    }
    if (formData.get('message')) {
        const eventId = Number(params.eventId);
        const userId = session.get('userId');
        const message = formData.get('message') as string;
        const post = await postChat(eventId, userId, message);
        if (post) {
            return redirect(`/events/${params.eventId}`);
        }
    }
    return redirect(`/events/${params.eventId}`);
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
    const { event, userId, chat, eventId, env } = useLoaderData<typeof loader>();
    const participants = event.participants as Participant[];
    const user = participants.find(participant => participant.userId === userId);
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            abscence: user?.abscence ?? [],
            remarks: user?.remarks ?? '',
        },
    });
    const chatForm = useForm<ChatData>({
        resolver: zodResolver(chatSchema),
        defaultValues: {
            message: '',
        }
    });
    const submit = useSubmit();
    const revalidator = useRevalidator();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [chatInputFocused, setChatInputFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    // 各候補日程の出席者数をカウントした配列
    const countAbscence = event.candidates?.map((candidate, index) => {
        return participants.filter(participant => participant.abscence[index] === '出席').length;
    });
    // 出席者数最大の候補日程のインデックスを取得
    const maxAbscence = Math.max(...countAbscence ?? []);
    // 出席者数最大の候補日程のインデックスの配列を取得
    const maxAbscenceIndexes = countAbscence?.reduce((acc, val, index) => {
        if (val === maxAbscence) {
            acc.push(index);
        }
        return acc;
    }, [] as number[]) ?? [];
    // 開催者名を取得
    const holder = participants.find(participant => participant.userId === event.holderId)?.name;


    useEffect(() => {
        const channel = supabase.channel('realtime chats').on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'Chats',
            filter: `eventId=eq.${eventId}`,
        }, (payload) => {
            // このイベントに関連するチャットのみを取得
            const newChat = payload.new;
            // userIdからusername, imageurlを取得
            const username = participants.find(participant => participant.userId === newChat.userId)?.name;
            const imageurl = participants.find(participant => participant.userId === newChat.userId)?.imageurl;
            // 自分以外の新規チャットを通知して、チャットを更新
            if (newChat.userId !== userId) {
                toast({
                    title: username,
                    description:
                        <div className="flex items-center space-x-2">
                            <Avatar>
                                <AvatarImage src={imageurl} alt={username} />
                                <AvatarFallback>{username}</AvatarFallback>
                            </Avatar>
                            <p>{newChat.message}</p>
                        </div>,
                    action: <ToastAction altText="閉じる">閉じる</ToastAction>
                })
            }
            navigate('.', { replace: true });
        }).subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase]);

    // リンク共有のコンポーネント
    async function ShareLink(sharelink: string) {
        try {
            await navigator.clipboard.writeText(sharelink);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to copy!', error);
        }
    }


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

    // chatの作成日時のフォーマット
    function formatChatDate(date: string): string {
        const formattedDate = new Date(date).toLocaleString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
        return formattedDate;
    }
    // chatデータをフォーマットしておく
    const formattedChat = chat.map(chat => {
        return {
            ...chat,
            createdAt_format: formatChatDate(chat.createdAt)
        }
    });

    // chatの投稿処理
    async function onChatSubmit(data: ChatData) {
        const message = data.message;
        const postChat = { eventId, userId, message };
        submit(postChat, { method: 'POST' });
        // formのリセット
        chatForm.reset();
    }


    async function onSubmit(data: FormData) {
        const formData = new FormData();
        setLoading(true);
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
                <HoverCard>
                    <HoverCardTrigger asChild>
                        {maxAbscenceIndexes.includes(index) ?
                            <Button type="button" variant="destructive">
                                {formatCandidateDate(candidate)}
                            </Button>
                            : <Button type="button" variant="secondary">
                                {formatCandidateDate(candidate)}
                            </Button>
                        }
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60">
                        <h2 className="font-bold pb-2">出席可能な参加者一覧</h2>
                        {participants.filter(participant => participant.abscence[index] === '出席').map(participant => (
                            <div key={participant.userId} className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarImage src={participant.imageurl} alt={participant.name} />
                                    <AvatarFallback>{participant.name}</AvatarFallback>
                                </Avatar>
                                <div>{participant.name}</div>
                            </div>
                        ))}
                    </HoverCardContent>
                </HoverCard>
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
                                            <SelectItem value="出席">
                                                出席⭕️
                                            </SelectItem>
                                            <SelectItem value="欠席">
                                                欠席❌
                                            </SelectItem>
                                            <SelectItem value="未定">
                                                未定❓
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    );
                }
                else {
                    // 記号をつけて表示
                    if (participant.abscence[index] === '出席') {
                        return <span>出席⭕️</span>
                    }
                    else if (participant.abscence[index] === '欠席') {
                        return <span>欠席❌</span>
                    }
                    else {
                        return <span>未定❓</span>
                    }
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-extrabold">{event.title}</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>チャット</Button>
                    </SheetTrigger>
                    <SheetContent className="w-[350px] sm:w-[600px]">
                        <SheetHeader className="py-3">
                            <SheetTitle>{event.title}</SheetTitle>
                            <SheetDescription>
                                イベントについて話し合いましょう
                            </SheetDescription>
                        </SheetHeader>
                        <Separator />
                        <div className="flex flex-col">
                            <div className="grid gap-4 py-4">
                                <ScrollArea className={chatInputFocused ? "h-[300px] sm:h-[500px]" : "h-[500px] sm:h-[600px]"}>
                                    {formattedChat.map(chat => {
                                        if (chat.userId === userId) {
                                            return <OwnChatBubble key={chat.createdAt} avatar={chat.imageurl} username={chat.username} message={chat.message} createdAt={chat.createdAt_format} />
                                        }
                                        else {
                                            return <OtherChatBubble key={chat.createdAt} avatar={chat.imageurl} username={chat.username} message={chat.message} createdAt={chat.createdAt_format} />
                                        }
                                    })}
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            </div>
                            <Separator />
                            <SheetFooter className="mt-4">
                                <Form {...chatForm}>
                                    <form onSubmit={chatForm.handleSubmit(onChatSubmit)}>
                                        <div className="flex items-center">
                                            <FormField
                                                control={chatForm.control}
                                                name="message"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field}
                                                                placeholder="メッセージを入力"
                                                                className="w-[250px] sm:w-[270px] mr-2"
                                                                onFocus={() => setChatInputFocused(true)}
                                                                onBlur={() => setChatInputFocused(false)} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="px-3">送信</Button>
                                        </div>
                                    </form>
                                </Form>
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="grid-cols-3 gap-5 mb-8">
                <p className="text-gray-600 text-lg place-content-start">{event.description}</p>
                <div className="grid-cols-3 place-items-end mt-4">
                    <nav>
                        <h3 className="text-lg font-bold">注意事項</h3>
                        <li className="text-gray-600 text-sm">参加者数が最大の日程が赤色で表示されます</li>
                        <li className="text-gray-600 text-sm">各日程にフォーカスすると出席者リストが表示されます</li>
                        <li className="text-gray-600 text-sm">出席表は横方向にスクロールできます</li>
                        <div className="flex items-center space-x-2 w-[350px] sm:w-[400px] mt-2">
                            <Label htmlFor="link" className="text-sm font-bold">イベントリンク</Label>
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    defaultValue={`${env.APP_URL}/events/${eventId}`}
                                />
                            </div>
                            <Button
                                size="sm"
                                className="px-3"
                                onClick={() => ShareLink(env.APP_URL)}
                            >
                                <span className="sr-only">Copy</span>
                                {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
                            </Button>
                        </div>
                    </nav>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <ScrollArea className="mx-auto w-auto">
                        <DataTable columns={columns} data={participants} />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    {loading ? (
                        <Button type="submit" className="mt-5" disabled>
                            <Loader2 className="w-6 h-6 mr-2" />
                            出席情報を更新中
                        </Button>
                    ) : (
                        <Button type="submit" className="mt-5">
                            出席情報を更新
                        </Button>
                    )}
                </form>
            </Form>
        </div>
    );
}