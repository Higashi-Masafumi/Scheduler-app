import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  Form,
  Link,
  useLoaderData,
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
import { ActionFunctionArgs, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = ({ location }) => {
  const path = location.pathname;
  return [
    { title: "調整くん" },
    {
      name: "description",
      content: "簡単に日程調整を行い、イベントを円滑に進めましょう。リアルタイムのチャットで参加者と円滑にコミュニケーションをとりましょう。"
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const path = request.url;
  const pathname = new URL(path).pathname;
  console.log(pathname);
  return { pathname };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <Error404 />;
    }
    if (error.status === 500) {
      return <Error500 />;
    }
    else {
      return (
        <div className="flex items-center justify-center w-full h-screen px-4">
          <Card className="max-w-sm mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">不明なエラーが発生しました</CardTitle>
              <CardDescription>
                予期せぬエラーが発生しました。しばらくしてから再度お試しください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Link to="/events">
                  <Button className="w-full">イベント一覧ページに戻る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }
  else {
    return (
      <div className="flex items-center justify-center w-full h-screen px-4">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">不明なエラーが発生しました</CardTitle>
            <CardDescription>
              予期せぬエラーが発生しました。しばらくしてから再度お試しください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <Link to="/events">
                <Button className="w-full">イベント一覧ページに戻る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function Error404() {
  return (
    <div className="flex items-center justify-center w-full h-screen px-4">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページが見つかりませんでした。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Link to="/events">
              <Button className="w-full">イベント一覧ページに戻る</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Error500() {
  return (
    <div className="flex items-center justify-center w-full h-screen px-4">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">お探しのイベントが見つかりませんでした</CardTitle>
          <CardDescription>
            このイベントは存在しないか、開催者によりすでに削除されています。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Link to="/events">
              <Button className="w-full">イベント一覧ページに戻る</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://accounts.google.com/gsi/client" async></script>
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
                <NavLink to="/events/participate">参加中のイベント一覧</NavLink>
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

// ログインページ、新規登録ページ、ウェルカムページ用のナビゲーションヘッダー
export function WelcomeNavigationHeader() {
  return (
    <header className="bg-slate-800">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex-1">
          <NavLink to="/" className="text-white font-bold text-xl">調整くん</NavLink>
        </div>
        <div>
          <NavLink to="/login" className="text-white mr-4">ログイン</NavLink>
          <NavLink to="/signup" className="text-white">新規登録</NavLink>
        </div>
      </div>
    </header>
  );
}
  


export default function App() {
  const { pathname } = useLoaderData<typeof loader>();
  return (
    <div>
      {pathname === "/login" || pathname === "/" || pathname === "/signup" ? <WelcomeNavigationHeader/> : <NavigationHeader />}
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
