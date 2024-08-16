import { Button } from '~/components/ui/button';
import { NavLink, useLoaderData, Form, redirect } from '@remix-run/react';
import { getSession } from '~/sessions';
import { getHoldingEvents } from '~/db/server.event';
import { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from '~/components/data-table';
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
} from '~/components/ui/alert-dialog';
import { deleteEvent } from '~/db/server.event';
import { Loader2 } from 'lucide-react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    // もしログインしていなかったら、ログイン画面にリダイレクト
    if (!userId) {
        return redirect('/login');
    }
    const holdingEvents = await getHoldingEvents(userId);
    return { holdingEvents };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));
    await deleteEvent(id);
    return redirect('/events');
};

export type Event = {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    holder: string;
};

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "title",
        header: "イベント名",
        cell: ({ row }) => {
            return (
                <NavLink
                    to={`/events/${row.original.id}`}
                    prefetch="viewport"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending" : isActive ? "active" : ""
                    }
                >
                    <Button 
                        variant="secondary" 
                        onClick={(event) => {
                            const target = event.target as HTMLButtonElement;
                            target.disabled = true;
                        }}
                    >
                        {row.original.title}
                    </Button>
                </NavLink>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "作成日",
        cell: ({ row }) => {
            return <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        }
    },
    {
        id: "actons",
        cell: ({ row }) => {
            return (
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button>編集</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>イベントを編集しますか?</AlertDialogTitle>
                            <AlertDialogDescription>
                                編集画面に遷移します
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction>
                                <NavLink to={`/events/edit/${row.original.id}`}>
                                    編集
                                </NavLink>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button variant="destructive">削除</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>イベントに関連する情報を全て削除しますか？</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            この操作は取り消せません。本当に削除しますか？
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <Form method="post">
                                <input type="hidden" name="id" value={row.original.id} />
                                <AlertDialogAction type="submit" className="w-full">削除</AlertDialogAction>
                            </Form>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        }
    }
];

export default function HoldingEvents() {
    const holdingEvents = useLoaderData<{ holdingEvents: Event[] }>();
    return (
        <div className="container mx-auto py-10">
            <div className="text-sm pb-4">
                <h1 className="text-3xl font-bold">あなたが開催中のイベント一覧</h1>
            </div>
            <div className="pb-5">
                <h3 className="text-base font-bold pb-2">注意事項</h3>
                <nav>
                    <li className="text-gray-600 text-xs">
                        参加中のイベント一覧です、横方向にスクロールできます
                    </li>
                    <li className="text-gray-600 text-xs">
                        イベント名をクリックするとイベント詳細ページに遷移します
                    </li>
                    <li className="text-gray-600 text-xs">
                        編集ボタンをクリックするとイベント情報を編集できます
                    </li>
                    <li className="text-gray-600 text-xs">
                        削除ボタンをクリックするとイベント情報を削除できます
                    </li>
                </nav>
            </div>
            <DataTable columns={columns} data={holdingEvents.holdingEvents} />
        </div>
    );
}
