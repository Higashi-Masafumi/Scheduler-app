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
import { useState } from "react";
import { Loader2 } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
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
        <NavLink
          to={`/events/${row.original.eventId}`}
          prefetch="viewport"
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "active" : ""
          }>
          <Button
            variant="secondary"
            onClick={(event) => {
              const target = event.target as HTMLButtonElement;
              target.disabled = true;
            }
            }>
            {row.original.title}
          </Button>
        </NavLink>
      );
    },
  },
  {
    accessorKey: "description",
    header: "説明",
    cell: ({ row }) => {
      {/*イベント説明が長い場合も想定されるので長さを制限*/ }
      return (
        <span>
          {row.original.description?.length ?? 0 > 10
            ? `${row.original.description?.slice(0, 10)}...`
            : row.original.description ?? ""}
        </span>
      );
    },
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
                <AlertDialogAction type="submit" className="w-full">退会</AlertDialogAction>
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

  // イベント詳細画面へのローディング
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "title",
      header: "イベント名",
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/events/${row.original.eventId}`}
            prefetch="viewport"
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "active" : ""
            }>
            {loading ?
              <Button variant="secondary" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                イベントへ遷移中
              </Button>
              :
              <Button
                variant="secondary"
                onClick={() => setLoading(true)}
              >
                {row.original.title}
              </Button>}
          </NavLink>
        );
      },
    },
    {
      accessorKey: "description",
      header: "説明",
      cell: ({ row }) => {
        {/*イベント説明が長い場合も想定されるので長さを制限*/ }
        return (
          <span>
            {row.original.description?.length ?? 0 > 10
              ? `${row.original.description?.slice(0, 10)}...`
              : row.original.description ?? ""}
          </span>
        );
      },
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
                  <AlertDialogAction type="submit" className="w-full">退会</AlertDialogAction>
                </Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }
    },
  ];
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
