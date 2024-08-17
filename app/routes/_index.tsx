import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { NavLink } from "@remix-run/react"
import React from 'react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gray-100">
      <div className="max-w-4xl w-full px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">調整くんへようこそ</h1>
          <p className="text-lg mb-6">
            簡単にスケジュール調整を行い、イベントを円滑に進めましょう。
          </p>
          <img
            src="../homepage.png"
            alt="イベントスケジューリング"
            className="mx-auto mb-6 w-full max-w-md rounded-lg shadow-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg rounded-lg p-6">
            <CardHeader>
              <CardTitle>イベントの簡単な管理</CardTitle>
              <CardDescription>
                イベントリンクを共有するだけで、会員ユーザーが簡単に参加できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="../eventexample.png"
                alt="イベント管理"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <h3 className="text-lg font-bold">
                  シンプルなインターフェースで、最も適した日程を簡単に調整できます。
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-lg p-6">
            <CardHeader>
              <CardTitle>リアルタイムチャット</CardTitle>
              <CardDescription>
                イベント内で直接話し合い、調整を行うことができます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="../chatexample.png"
                alt="リアルタイムチャット"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <h3 className="text-lg font-bold">
                  リアルタイムチャットで、参加者とのコミュニケーションを円滑に行えます。
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <NavLink to="/signup">
            <Button className="px-6 py-3 text-lg">イベント調整を始める</Button>
          </NavLink>
        </div>
        <p className="text-center my-7 text-gray-500">
          <NavLink to="/privacy-policy" className="underline">プライバシーポリシー</NavLink>
        </p>
      </div>
    </div>
  );
}
