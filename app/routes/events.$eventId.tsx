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
import { useState } from 'react';
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


// Zod schemaの定義
const formSchema = z.object({
    abscence: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    const eventId = params.eventId;
    console.log(eventId);
    await participateinEvent(userId, Number(eventId));
    const event = await getEvent(Number(eventId));
    return { event, userId };
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get('Cookie'));
    const formData = await request.formData();
    const participantId = Number(formData.get('participantId'));
    const abscence = JSON.parse(formData.get('abscence') as string);
    await updateAbscence(participantId, abscence);
    return redirect('/events');
}

type Participant = {
    id: number;
    userId: number;
    name: string;
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
        },
    });
    const submit = useSubmit();

    async function onSubmit(data: FormData) {
        const formData = new FormData();
        formData.append('participantId', String(user?.id));
        formData.append('abscence', JSON.stringify(data.abscence));
        submit(formData, {method: 'POST'});
    }

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
                                                <SelectValue>{field.value}</SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
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
                    return <span>{participant.abscence[index]}</span>
                }
            },
        })),
        {
            accessorKey: "remarks",
            header: "備考",
        }
    ];


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="container mx-auto py-10 px-5">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-extrabold">{event.title}</h1>
                    </div>
                    <div className="mb-8">
                        <p className="text-gray-600 text-lg">{event.description}</p>
                    </div>
                    <DataTable columns={columns} data={participants} />
                    <Button type="submit" className="mt-8">出席情報を更新する</Button>
                </div>
            </form>
        </Form>
    );
}