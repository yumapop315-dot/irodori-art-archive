"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tagPath } from "@/lib/paths";
import { matchStudents, type StudentOption } from "./TagSuggestInput";

export type { StudentOption };

export default function SearchForm({
  students,
  initialChips = [],
  sort = "new",
}: {
  students: StudentOption[];
  initialChips?: string[];
  sort?: string;
}) {
  const router = useRouter();
  const [chips, setChips] = useState<string[]>(initialChips);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(
    () => matchStudents(input, students, chips),
    [input, chips, students]
  );

  function addChip(name: string) {
    if (!chips.includes(name)) setChips([...chips, name]);
    setInput("");
    setOpen(false);
    setHi(0);
  }

  function submit(extra?: string) {
    const tags = [...chips];
    const t = (extra ?? input).trim();
    if (t && !tags.includes(t)) tags.push(t);
    setInput("");
    const sortQ = sort !== "new" ? `?sort=${sort}` : "";
    // タグ1つならまとめサイト風のパス、複数はクエリ検索
    if (tags.length === 1) {
      router.push(`${tagPath(tags[0])}${sortQ}`);
      return;
    }
    const q = new URLSearchParams();
    if (tags.length) q.set("tags", tags.join(","));
    if (sort !== "new") q.set("sort", sort);
    const s = q.toString();
    router.push(s ? `/?${s}` : "/");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setHi((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[hi]) addChip(suggestions[hi].name);
      else submit();
    } else if (e.key === "Backspace" && input === "" && chips.length) {
      setChips(chips.slice(0, -1));
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2">
        <div className="flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-3xl border border-gray-300 bg-white px-3 py-1.5 shadow-sm focus-within:border-sky-400">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setChips(chips.filter((x) => x !== c))}
              className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs text-sky-700 hover:bg-red-100 hover:text-red-600"
              title="クリックで削除"
            >
              {c} <span aria-hidden="true">✕</span>
            </button>
          ))}
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
              setHi(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={chips.length ? "" : "キャラ名で検索（ひらがな可）"}
            /* text-base(16px)未満だとiOS Safariがフォーカス時に自動ズームするので下げない */
            className="min-w-[120px] flex-1 bg-transparent py-1 text-base focus:outline-none sm:text-sm"
            aria-label="キャラ名で検索"
            enterKeyHint="search"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <button onClick={() => submit()} className="ba-btn shrink-0 px-6 py-2.5 text-sm">
          <span>検索</span>
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.name}>
              <button
                onMouseEnter={() => setHi(i)}
                onClick={() => addChip(s.name)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                  i === hi ? "bg-sky-50" : ""
                }`}
              >
                <span>
                  {s.name}
                  {s.aliases[0] && (
                    <span className="ml-2 text-xs text-gray-400">{s.aliases[0]}</span>
                  )}
                </span>
                <span className="text-xs text-gray-400">{s.school}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
