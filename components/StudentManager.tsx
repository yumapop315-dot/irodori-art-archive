"use client";

// 生徒（キャラタグ）と陣営（学園）マスタの管理UI。新キャラ・新陣営はここから追加する。
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentOption } from "./TagSuggestInput";

export default function StudentManager({
  students,
  schools,
}: {
  students: StudentOption[];
  schools: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("その他");
  const [aliases, setAliases] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [newSchool, setNewSchool] = useState("");
  const [schoolMsg, setSchoolMsg] = useState("");

  async function api(body: Record<string, unknown>): Promise<boolean> {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  }

  function edit(s: StudentOption) {
    setName(s.name);
    setSchool(schools.includes(s.school) ? s.school : "その他");
    setAliases(s.aliases.join(","));
    setMsg("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await api({ action: "setStudent", name: name.trim(), school, aliases })) {
      setMsg(`「${name.trim()}」を保存しました`);
      setName("");
      setAliases("");
      setSchool("その他");
      router.refresh();
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg("保存に失敗しました");
    }
  }

  async function addSchool() {
    const n = newSchool.trim();
    if (!n) return;
    if (await api({ action: "addSchool", name: n })) {
      setSchoolMsg(`陣営「${n}」を追加しました`);
      setNewSchool("");
      router.refresh();
      setTimeout(() => setSchoolMsg(""), 2500);
    }
  }

  async function deleteSchool(n: string) {
    const count = students.filter((s) => s.school === n).length;
    if (
      !confirm(
        `陣営「${n}」を削除しますか？\n所属している${count}名の生徒は「その他」に移動します。`
      )
    )
      return;
    if (await api({ action: "deleteSchool", name: n })) {
      setSchoolMsg(`陣営「${n}」を削除しました`);
      router.refresh();
      setTimeout(() => setSchoolMsg(""), 2500);
    }
  }

  // キャラの陣営を移動（別名は保持したまま学園だけ変更）
  async function moveStudent(s: StudentOption, newSchool: string) {
    if (newSchool === s.school) return;
    await api({
      action: "setStudent",
      name: s.name,
      school: newSchool,
      aliases: s.aliases.join(","),
    });
    router.refresh();
  }

  // キャラタグを削除（タグ付けも解除される）
  async function removeStudent(s: StudentOption) {
    if (
      !confirm(
        `キャラ「${s.name}」を削除しますか？\nこのキャラが付いている投稿からもタグが外れます（元に戻せません）。`
      )
    )
      return;
    if (await api({ action: "deleteStudent", name: s.name })) {
      router.refresh();
    }
  }

  const isNew = name.trim() !== "" && !students.some((s) => s.name === name.trim());

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="ba-heading mb-1 text-sm text-gray-700">
        キャラタグ（生徒マスタ）の管理
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        新キャラが実装されたらここで追加してください。追加すると検索候補・キャラ一覧・タグ付けにすぐ反映されます。
        別名にフルネームや愛称をカンマ区切りで入れると、その表記でも検索できるようになります。
      </p>

      <form onSubmit={submit} className="flex flex-wrap items-center gap-2 text-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="キャラ名（カタカナ推奨）"
          required
          className="w-44 rounded-lg border border-gray-300 px-3 py-1.5 focus:border-sky-400 focus:outline-none"
        />
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5"
        >
          {schools.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          placeholder="別名（例: 小鳥遊ホシノ,ほしのん）"
          className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 focus:border-sky-400 focus:outline-none"
        />
        <button className="ba-btn px-4 py-1.5 text-sm">
          <span>{isNew ? "新規追加" : "追加/更新"}</span>
        </button>
        {msg && <span className="text-xs text-emerald-600">{msg}</span>}
      </form>

      {/* 陣営（学園）の管理 */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-xs font-bold text-gray-500">陣営（学園）の管理</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {schools.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm"
            >
              {s}
              {s !== "その他" && (
                <button
                  onClick={() => deleteSchool(s)}
                  className="text-gray-400 hover:text-red-500"
                  title={`陣営「${s}」を削除（所属生徒は「その他」へ）`}
                  aria-label={`${s}を削除`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
          <input
            value={newSchool}
            onChange={(e) => setNewSchool(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSchool();
              }
            }}
            placeholder="新しい陣営名"
            className="w-36 rounded-lg border border-gray-300 px-3 py-1 text-xs focus:border-sky-400 focus:outline-none"
          />
          <button
            onClick={addSchool}
            className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
          >
            陣営を追加
          </button>
          {schoolMsg && <span className="text-xs text-emerald-600">{schoolMsg}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-xs text-sky-600 hover:underline"
      >
        {open ? "▲ 登録済みキャラを閉じる" : `▼ 登録済みキャラを管理（${students.length}名）`}
      </button>

      {open && (
        <div className="mt-2 space-y-4">
          <p className="text-xs text-gray-500">
            名前クリックで編集フォームに読み込み（別名・改名）。陣営の選択で即移動、✕で削除できます。
          </p>
          {schools.map((sc) => {
            const list = students.filter((s) =>
              sc === "その他"
                ? s.school === sc || !schools.includes(s.school)
                : s.school === sc
            );
            if (list.length === 0) return null;
            return (
              <div key={sc}>
                <p className="mb-1 text-xs font-bold text-gray-500">
                  {sc}
                  <span className="ml-1 font-normal text-gray-400">（{list.length}名）</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 py-0.5 pl-2.5 pr-1 text-xs text-gray-700"
                    >
                      <button
                        type="button"
                        onClick={() => edit(s)}
                        title={s.aliases.length ? `別名: ${s.aliases.join(", ")}` : "クリックで編集"}
                        className="hover:text-sky-700 hover:underline"
                      >
                        {s.name}
                      </button>
                      <select
                        value={schools.includes(s.school) ? s.school : "その他"}
                        onChange={(e) => moveStudent(s, e.target.value)}
                        title="陣営を移動"
                        aria-label={`${s.name}の陣営を移動`}
                        className="max-w-24 rounded border border-gray-300 bg-white px-0.5 py-0 text-[10px] text-gray-500"
                      >
                        {schools.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeStudent(s)}
                        title={`「${s.name}」を削除`}
                        aria-label={`${s.name}を削除`}
                        className="rounded-full px-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
