import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import { useLoaderData } from '@remix-run/react';
import { getSession } from '~/sessions';
import { getHoldingEvents } from '~/db/server.event';
import { LoaderFunctionArgs } from '@remix-run/node';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from '~/components/data-table';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
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

export type Event = {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    holder: string;
};

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "title",
        header: "イベント名",
    },
    {
        accessorKey: "description",
        header: "説明",
    },
    {
        accessorKey: "createdAt",
        header: "作成日",
    },
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
