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

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    // もしログインしていなかったら、ログイン画面にリダイレクト
    if (!userId) {
        return redirect('/login');
    }
    const holdingEvents = await getHoldingEvents(userId);
    // もしholdingeventsがnullだったら、ダミーデータを返す
    if (!holdingEvents) {
        return {
            holdingEvents: [
                {
                    id: 1,
                    title: 'イベントタイトル',
                    description: 'イベントの説明',
                    createdAt: '作成日'
                },
            ],
        };
    }
    return { holdingEvents };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));
    await deleteEvent(id);
    return redirect('/ events');
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
            return <Button variant="secondary">
                <NavLink to={`/events/${row.original.id}`}>{row.original.title}</NavLink>
            </Button>
        }
    },
    {
        accessorKey: "description",
        header: () => {
            return <span className="text-sm">説明</span>
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
                                <AlertDialogAction type="submit">削除</AlertDialogAction>
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
            <div className="text-sm pb-10">
                <h1 className="text-3xl font-bold">あなたが開催中のイベント一覧</h1>
            </div>
            <DataTable columns={columns} data={holdingEvents.holdingEvents} />
        </div>
    );
}
