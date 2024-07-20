import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "app/components/ui/table"
import { useLoaderData, redirect, NavLink } from "@remix-run/react";
import { getSession, commitSession } from "~/sessions";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu";
import { Navigation } from "lucide-react";
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
  return { userId };
}

export default function Index() {
  return (
    <div>
      <Table>
        <TableCaption>日程調整中のイベント一覧</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-fit">イベント名</TableHead>
            <TableHead className="max-w-fit">開催予定日程</TableHead>
            <TableHead className="max-w-fit">あなたの出席</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        </TableBody>
      </Table>
    </div>
  )
}
