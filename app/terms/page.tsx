import Link from "next/link";
import {
  SITE_CONTACT_X,
  SITE_CONTACT_X_URL,
  SITE_NAME,
  SITE_OPERATOR,
  SITE_URL,
} from "@/lib/site";

export const metadata = { title: "利用規約・プライバシーポリシー" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 text-sm leading-relaxed">
      <section>
        <h1 className="ba-heading mb-3 text-xl">利用規約</h1>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>
            本サイトは、X(旧Twitter)に投稿されたブルーアーカイブのファンアートを検索・閲覧できる非公式のファンサイトです。ゲーム公式・権利者とは一切関係ありません。
          </li>
          <li>
            画像は本サイトのサーバーに保存せず、X上の投稿を参照して表示しています。著作権は各投稿者に帰属します。
          </li>
          <li>
            本サイトには、成人向け表現を含む区分（きわどい版・R18版）があります。これらの区分は
            18歳未満の方および高校生の閲覧を固くお断りします。年齢確認のうえご利用ください。
          </li>
          <li>
            登録された投稿は運営者が内容を確認し、健全版 / きわどい版 / R18版のいずれかに区分します。
            区分にそぐわない投稿や、公序良俗に反する投稿は予告なく削除します。
          </li>
          <li>
            虚偽の登録・スパム・悪質な利用を確認した場合、予告なくアクセスを制限することがあります。
          </li>
          <li>本サイトの利用によって生じたいかなる損害についても、運営者は責任を負いません。</li>
          <li>本規約は予告なく変更されることがあります。</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">運営者情報</h2>
        <dl className="space-y-1 text-gray-700">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-gray-500">サイト名</dt>
            <dd>{SITE_NAME}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-gray-500">URL</dt>
            <dd>{SITE_URL}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-gray-500">運営者</dt>
            <dd>{SITE_OPERATOR}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-gray-500">連絡先</dt>
            <dd>
              <a
                href={SITE_CONTACT_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline"
              >
                @{SITE_CONTACT_X}
              </a>
              <span className="ml-2 text-gray-500">
                （X。掲載停止のご依頼は
                <Link href="/removal" className="text-sky-600 hover:underline">
                  専用フォーム
                </Link>
                が確実です）
              </span>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-gray-700">
          本サイトは個人が運営する非公式のファンサイトであり、株式会社Yostar、NEXON Games
          その他の権利者とは一切関係ありません。
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">掲載停止（削除依頼）について</h2>
        <p className="text-gray-700">
          ご自身の投稿の掲載を停止したい場合は、
          <Link href="/removal" className="text-sky-600 hover:underline">
            削除依頼フォーム
          </Link>
          からご連絡ください。確認のうえ、速やかに削除いたします。
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">プライバシーポリシー</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>
            本サイトは、いいね・フォロー・ミュートなどの利用状態をお使いのブラウザ(localStorage)に保存します。アカウント登録は不要で、個人を特定する情報は収集しません。
          </li>
          <li>
            いいねの集計とスパム対策のため、匿名の識別子とIPアドレスをサーバーで処理します。これらを第三者に提供することはありません。
          </li>
          <li>削除依頼フォームで入力された連絡先は、依頼対応の目的にのみ使用します。</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">広告について</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>
            本サイトは、第三者配信の広告サービス「Google AdSense」を利用しています（健全版のみ）。
          </li>
          <li>
            きわどい版・R18版では、アフィリエイトプログラムを利用して「DLsite」へのリンクを掲載しています。
            当該リンクは広告であり、リンク経由で商品が購入された場合、運営者が販売元から紹介料を受け取ることがあります。
            広告リンクには「PR」と表示しています。
          </li>
          <li>
            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
            パーソナライズ広告は
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline"
            >
              Googleの広告設定
            </a>
            から無効にできます。
          </li>
          <li>
            Cookieの詳細やデータの取り扱いについては
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline"
            >
              Googleのポリシーと規約
            </a>
            をご確認ください。
          </li>
        </ul>
      </section>
    </div>
  );
}
