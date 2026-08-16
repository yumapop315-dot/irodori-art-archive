"use client";

// ひらがな・ローマ字・別名対応のキャラ名入力欄（候補ドロップダウン付き）
import { useEffect, useMemo, useRef, useState } from "react";
import { hiraToKata, kataToRomaji } from "@/lib/normalize";

export type StudentOption = { name: string; aliases: string[]; school: string };

// 候補は前方一致のみ（「あ」→ ア行の頭文字から始まる名前だけを表示）
export function matchStudents(
  input: string,
  students: StudentOption[],
  exclude: string[]
): StudentOption[] {
  const t = input.trim();
  if (!t) return [];
  const kata = hiraToKata(t);
  const lower = t.toLowerCase();
  return students
    .filter(
      (s) =>
        !exclude.includes(s.name) &&
        (s.name.startsWith(kata) ||
          s.aliases.some(
            (a) =>
              a.startsWith(t) || a.startsWith(kata) || hiraToKata(a).startsWith(kata)
          ) ||
          (/^[a-zA-Z]+$/.test(t) && kataToRomaji(s.name).startsWith(lower)))
    )
    .slice(0, 8);
}

export default function TagSuggestInput({
  students,
  exclude,
  onSelect,
  placeholder,
  id,
  compact = false,
}: {
  students: StudentOption[];
  exclude: string[];
  onSelect: (name: string) => void;
  placeholder?: string;
  id?: string;
  compact?: boolean;
}) {
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
    () => matchStudents(input, students, exclude),
    [input, students, exclude]
  );

  function pick(name: string) {
    onSelect(name);
    setInput("");
    setOpen(false);
    setHi(0);
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
      if (open && suggestions[hi]) pick(suggestions[hi].name);
      else if (input.trim()) pick(hiraToKata(input.trim()));
    }
  }

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1">
      <input
        id={id}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? "キャラ名（ひらがなでもOK）"}
        /* text-base(16px)未満だとiOS Safariがフォーカス時に自動ズームする */
        className={`w-full rounded-lg border border-gray-300 bg-white text-base focus:border-sky-400 focus:outline-none sm:text-sm ${
          compact ? "px-3 py-1.5" : "px-3 py-2"
        }`}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full min-w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                onMouseEnter={() => setHi(i)}
                onClick={() => pick(s.name)}
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
