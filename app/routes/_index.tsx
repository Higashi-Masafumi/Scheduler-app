import type { MetaFunction } from "@remix-run/node";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "~/components/ui/table"
export const meta: MetaFunction = () => {
  return [
    { title: "Scheduler for you" },
    { name: "description", content: "Welcome to Schedule App" },
  ];
};

export default function Index() {
  return (
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
  )
}
