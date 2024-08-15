import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, redirect, NavLink, Form } from "@remix-run/react";
import { getSession, commitSession } from "~/sessions";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
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
} from "~/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { getEvents, withdrawEvent } from "~/db/server.event";

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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  await withdrawEvent(id);
  return redirect(".");
}

export type Event = {
  id: number;
  eventId: number;
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
          <NavLink to={`/events/${row.original.eventId}`}>{row.original.title}</NavLink>
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
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">退会</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>イベントから退会しますか？</AlertDialogHeader>
            <AlertDialogDescription>
              この操作は取り消せません。本当に退会しますか？
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <Form
                method="post"
              >
                <input type="hidden" name="id" value={row.original.id} />
                <AlertDialogAction type="submit">退会</AlertDialogAction>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }
  },
];

export default function Index() {
  const { events } = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto">
      <div className="text-sm pt-10 pb-5">
        <h1 className="text-3xl font-bold">あなたが参加中のイベント一覧</h1>
      </div>
      <div className="pb-5">
        <h3 className="text-base font-bold">注意事項</h3>
        <nav>
          <li className="text-xs text-gray-600">
            参加イベントの一覧です、横方向にスクロールできます
          </li>
          <li className="text-xs text-gray-600">
            イベント名をクリックするとイベント詳細ページに遷移します
          </li>
          <li className="text-xs text-gray-600">
            退会ボタンをクリックするとイベントから退会できます
          </li>
        </nav>
      </div>
      <DataTable columns={columns} data={events} />
    </div>
  )
}
