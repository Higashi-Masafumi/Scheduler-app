import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, redirect, NavLink } from "@remix-run/react";
import { getSession, commitSession } from "~/sessions";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { getEvents } from "~/db/server.event";
export const meta: MetaFunction = () => {
  return [
    { title: "Scheduler for you" },
    { name: "description", content: "Welcome to Schedule App" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  console.log("userId", userId);
  if (!userId) {
    return redirect("/login");
  }
  const events = await getEvents(userId);
  return { events };
}

export type Event = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "イベント名",
    cell: ({ row }) => {
      return (
        <Button variant="secondary">
          <NavLink to={`/events/${row.original.id}`}>{row.original.title}</NavLink>
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "説明",
  },
  {
    accessorKey: "holder",
    header: "開催者",
  },
  {
    accessorKey: "createdAt",
    header: "作成日",
    cell: ({ row }) => {
      return <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>;
    },
  },
];

export default function Index() {
  const { events } = useLoaderData<typeof loader>();
  console.log("events", events);
  return (
    <div className="container mx-auto">
      <div className="text-sm py-10">
        <h1 className="text-3xl font-bold">あなたが参加中のイベント一覧</h1>
      </div>
      <DataTable columns={columns} data={events} />
    </div>
  )
}
