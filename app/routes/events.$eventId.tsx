import { useLoaderData } from '@remix-run/react';
import { getSession } from '~/sessions';
import { getHoldingEvents } from '~/db/server.event';
import { LoaderFunctionArgs } from '@remix-run/node';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from '~/components/data-table';
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { getEvent } from '~/db/server.event';
import { participateinEvent } from '~/db/server.user';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    const eventId = params.eventId;
    console.log(eventId);
    await participateinEvent(userId, Number(eventId));
    const event = await getEvent(Number(eventId));
    return { event, userId };
};

type Participant = {
    id: number;
    name: string;
    abscence: boolean[];
}

export default function EventTable() {
    const { event, userId } = useLoaderData<typeof loader>();
    const participants = event.participants as Participant[];

    const columns: ColumnDef<Participant>[] = [
        {
            accessorKey: "name",
            header: "名前",
        },
        ...(event.candidates ?? []).map((candidate, index) => ({
            accessorKey: `absence.${index}`,
            header: () => <Label>{new Date(candidate).toLocaleString()}</Label>,
            cell: ({ row }: { row: { original: Participant } }) => {
                const participant = row.original;
                // 自分自身の行のみ編集可能
                const isEditable = participant.id === userId;
                return (
                    <Checkbox
                        checked={participant.abscence[index]}
                        onChange={(e) => {
                            if (isEditable) {
                                const updatedAbsence = [...participant.abscence];
                                updatedAbsence[index] = (e.target as HTMLInputElement).checked;
                                // 更新処理
                            }
                        }}
                        disabled={!isEditable}
                    />
                );
            },
        })),
    ];

    return (
        <div className="container mx-auto py-10 px-5 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-indigo-600">{event.title}</h1>
            </div>
            <div className="mb-8">
                <p className="text-gray-600 text-lg">{event.description}</p>
            </div>
            <ScrollArea className="max-w-full border border-gray-200 rounded-lg shadow-inner">
                <DataTable columns={columns} data={participants} />
            </ScrollArea>
        </div>
    );
}