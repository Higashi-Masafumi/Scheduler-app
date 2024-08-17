import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>プライバシーポリシー</CardTitle>
                </CardHeader>
                <CardContent>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">はじめに</h2>
                        <p className="mt-2">
                            当社は、個人情報の保護を最優先に考えています。ここでは、当社が収集する個人情報の種類、その情報をどのように利用し、保護しているかについて、詳細に説明します。すべての利用者が安心して当社のサービスを利用できるよう努めています。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">個人情報の収集について</h2>
                        <p className="mt-2">
                            当社は、ユーザーの皆様から次の個人情報を収集します。これらの情報は、当社のサービスを適切に提供するために必要です。
                        </p>
                        <ul className="list-disc list-inside mt-2">
                            <li>メールアドレス：ユーザーがログインし、サービスを利用するために必要です。</li>
                            <li>ユーザーネーム：他のユーザーとのコミュニケーションや識別に利用します。</li>
                        </ul>
                        <p className="mt-2">
                            これらの情報は、ユーザーが登録時に入力した内容に基づきます。当社は、必要以上の情報を収集することはありません。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">クッキーの利用について</h2>
                        <p className="mt-2">
                            クッキーとは、ウェブサイトが利用者のコンピュータに送信し、保存される小さなデータファイルのことです。これにより、ウェブサイトは利用者を識別し、同じユーザーであることを確認できます。
                        </p>
                        <p className="mt-2">
                            当社では、ユーザーを識別するためにクッキーを使用していますが、ユーザーの好みや行動に基づいたカスタマイズには使用していません。クッキーの利用は、サービスの基本的な機能を提供するために限定されています。
                        </p>
                        <p className="mt-2">
                            なお、クッキーは利用者のブラウザ設定によって無効にすることができますが、その場合、当社のサービスの一部機能が利用できなくなることがあります。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">個人情報の利用および第三者提供について</h2>
                        <p className="mt-2">
                            当社は、ユーザーの個人情報を以下の目的で利用します。
                        </p>
                        <ul className="list-disc list-inside mt-2">
                            <li>サービスの提供および運営</li>
                            <li>ユーザーサポートおよび問い合わせ対応</li>
                            <li>サービスの改善および新機能の開発</li>
                        </ul>
                        <p className="mt-2">
                            当社は、ユーザーの同意を得ることなく個人情報を第三者に提供することはありません。ただし、法律に基づき要求された場合や、ユーザーの生命、身体または財産を保護するために必要であると判断された場合には、例外的に情報を提供することがあります。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">ユーザーの権利について</h2>
                        <p className="mt-2">
                            ユーザーは、登録した個人情報をいつでも確認し、更新することができます。特に、ユーザーネームやアバターは、プロフィール画面から簡単に変更することが可能です。初期設定では、匿名性を保つためにアノニマスアバターが設定されています。
                        </p>
                        <p className="mt-2">
                            また、ユーザーは個人情報の削除を希望する場合、当社に連絡することで対応を依頼することができます。ただし、削除の際には、サービスの利用が継続できなくなる場合があります。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">個人情報の保護について</h2>
                        <p className="mt-2">
                            当社は、ユーザーの個人情報を保護するために、厳重なセキュリティ対策を講じています。具体的には、以下のような技術を採用しています。
                        </p>
                        <ul className="list-disc list-inside mt-2">
                            <li>
                                <strong>HTTPS通信:</strong> 
                                当社のサービスは、HTTPSという暗号化された通信プロトコルを使用しています。これにより、ユーザーのブラウザと当社のサーバー間の通信は暗号化され、第三者がその内容を読み取ることができないようになっています。
                            </li>
                            <li>
                                <strong>パスワードの暗号化保存:</strong>
                                ユーザーが登録するパスワードは、暗号化された状態でデータベースに保存されます。暗号化とは、データを一定の規則に基づいて変換し、そのままでは理解できない形式にする技術のことです。この暗号化技術により、第三者がパスワードを知ることはできません。
                            </li>
                            <li>
                                <strong>RLS（Row-Level Security）:</strong>
                                当社のデータベースは、RLS（行レベルセキュリティ）という技術を用いて保護されています。RLSは、ユーザーごとにアクセス可能なデータを制限する技術で、これにより他のユーザーの個人情報が見られることはありません。
                            </li>
                        </ul>
                        <p className="mt-2">
                            これらのセキュリティ対策は、ユーザーの個人情報が外部に漏れたり、第三者に不正にアクセスされたりすることを防ぐために行われています。当社は、これらの対策を継続的に見直し、強化していきます。
                        </p>
                    </section>
                    <section className="py-4">
                        <h2 className="text-lg font-bold">プライバシーポリシーの変更について</h2>
                        <p className="mt-2">
                            当社は、法律の改正やサービス内容の変更に伴い、プライバシーポリシーを変更することがあります。変更がある場合には、当サイト上で通知し、最新のポリシーを常にご確認いただけるようにします。ユーザーは、プライバシーポリシーの変更後も引き続き当社のサービスを利用することで、変更後のポリシーに同意したものとみなされます。
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
