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
                    createdAt: '作成日',
                },
            ],
        };
    }
    return { holdingEvents };
};

export default function Profile() {
    const data = useLoaderData<typeof loader>();
    return (
        <div>
            <div className="space-y-4">
                <h1 className="items-center">Profile</h1>
            </div>
            <Table>
                <TableCaption>あなたが開催中のイベント</TableCaption>
                <TableHead>
                    <TableRow>
                        <TableHeader>イベント名</TableHeader>
                        <TableHeader>作成日</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.holdingEvents.map((event) => (
                        <TableRow key={event.id}>
                            <TableCell>{event.title}</TableCell>
                            <TableCell>{event.description}</TableCell>
                            <TableCell>{event.createdAt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
