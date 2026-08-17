import Link from "next/link";
import { allStudents, RATING_LABELS } from "@/lib/db";
import { getMode } from "@/lib/mode";
import { isAdminRequest } from "@/lib/adminAuth";
import RegisterForm from "@/components/RegisterForm";
import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";

// 管理人専用ページなので検索避け
export const metadata = {
  title: "イラストを登録",
  robots: { index: false, follow: false },
};

const NOTICE = {
  all: {
    badge: null as string | null,
    badgeCls: "",
    boxCls: "border-amber-200 bg-amber-50 text-amber-800",
    guide: "今は健全版に登録します。きわどい絵・R-18絵はヘッダーの切り替えから各モードで登録してください。",
    rule: "R-18・きわどいイラストの登録は禁止です（水着・下着程度は「きわどい版」へ）。",
  },
  sensitive: {
    badge: "きわどい版",
    badgeCls: "bg-amber-500",
    boxCls: "border-amber-300 bg-amber-50 text-amber-800",
    guide: "今はきわどい版に登録します。水着・下着などセンシティブ寄りの健全絵はこちらへ。",
    rule: "乳首・性器・性行為が含まれるものはR18版へ。完全に健全な絵は健全版へ登録してください。",
  },
  r18: {
    badge: "R18版",
    badgeCls: "bg-rose-600",
    boxCls: "border-rose-200 bg-rose-50 text-rose-800",
    guide: "今はR18版に登録します。健全な絵・きわどい絵は各モードで登録してください。",
    rule: "健全な絵はR18版ではなく健全版・きわどい版へ。判断に迷う場合はR18版でOKです（管理人が振り分けます）。",
  },
};

export default async function RegisterPage() {
  // 登録は管理人のみ
  if (!(await isAdminRequest())) return <AdminLogin />;

  const mode = await getMode();
  const n = NOTICE[mode];
  const students = allStudents().map((s) => ({
    name: s.name,
    school: s.school,
    aliases: s.aliases ? s.aliases.split(",").filter(Boolean) : [],
  }));
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="ba-heading mb-1 text-xl">
        イラスト登録
        {n.badge && (
          <span className={`ml-2 rounded-md px-2 py-0.5 text-xs text-white ${n.badgeCls}`}>
            {n.badge}
          </span>
        )}
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        {n.guide}（現在のモード: {RATING_LABELS[mode]}）
      </p>
      <div className={`mb-6 space-y-2 rounded-2xl border p-4 text-sm ${n.boxCls}`}>
        <p>X(旧Twitter)の投稿URLを入力して、情報を登録してください。</p>
        <ul className="list-inside list-disc space-y-1">
          <li>{n.rule}</li>
          <li>画像が含まれていない投稿は登録できません。</li>
          <li>キャラ名タグはここで選べます。タグを付けずに登録すると、本文から自動でタグ付けされたうえで<b>非公開</b>のまま残るので、管理画面で確認して公開してください。</li>
        </ul>
      </div>
      <RegisterForm students={students} />
      <p className="mt-6 text-center text-sm">
        <Link href="/admin" className="text-sky-600 hover:underline">
          ← 管理画面へ戻る
        </Link>
      </p>
    </div>
  );
}
