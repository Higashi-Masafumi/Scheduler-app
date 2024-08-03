import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  Form,
} from "@remix-run/react";
import "./tailwind.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/toaster";
import { getSession, destroySession } from "~/sessions";
import { redirect } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function NavigationHeader() {
  return (
    <header className="bg-slate-800">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">メニュー選択</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>メニュー</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <NavLink to="/">参加中のイベント一覧</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NavLink to="/events">あなたの開催中イベント</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NavLink to="/new-events">新規イベント作成</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NavLink to="/profile">プロフィール編集</NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Form method="post" className="flex justify-end pr-15">
          <Button variant="outline" type="submit">ログアウト</Button>
        </Form>
      </div>
    </header>
  );
}


export default function App() {
  return (
    <div>
      <NavigationHeader />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
