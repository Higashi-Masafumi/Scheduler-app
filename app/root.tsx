import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
} from "@remix-run/react";
import "./tailwind.css";
import { 
DropdownMenu,
DropdownMenuContent,
DropdownMenuGroup,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuPortal,
DropdownMenuSeparator,
DropdownMenuShortcut,
DropdownMenuSub,
DropdownMenuSubContent,
DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/toaster";

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
      <div className="container mx-8 flex justify-between items-center p-4">
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
