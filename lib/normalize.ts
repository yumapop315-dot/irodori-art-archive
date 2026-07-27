// 検索語の表記ゆれ吸収: ひらがな/カタカナ/ローマ字/別名/部分一致

export function hiraToKata(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0x60)
  );
}

const ROMAJI: [string, string][] = [
  ["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"],
  ["シャ", "sha"], ["シュ", "shu"], ["ショ", "sho"], ["シェ", "she"],
  ["チャ", "cha"], ["チュ", "chu"], ["チョ", "cho"], ["チェ", "che"],
  ["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"],
  ["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"],
  ["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"],
  ["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"],
  ["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"],
  ["ジャ", "ja"], ["ジュ", "ju"], ["ジョ", "jo"], ["ジェ", "je"],
  ["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"],
  ["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"],
  ["ファ", "fa"], ["フィ", "fi"], ["フェ", "fe"], ["フォ", "fo"],
  ["ウィ", "wi"], ["ウェ", "we"], ["ウォ", "wo"],
  ["ティ", "ti"], ["ディ", "di"], ["デュ", "dyu"], ["トゥ", "tu"],
  ["ヴァ", "va"], ["ヴィ", "vi"], ["ヴェ", "ve"], ["ヴォ", "vo"],
  ["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"],
  ["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"],
  ["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"],
  ["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"],
  ["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"],
  ["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"],
  ["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"],
  ["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"],
  ["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"],
  ["ワ", "wa"], ["ヲ", "o"], ["ン", "n"],
  ["ガ", "ga"], ["ギ", "gi"], ["グ", "gu"], ["ゲ", "ge"], ["ゴ", "go"],
  ["ザ", "za"], ["ジ", "ji"], ["ズ", "zu"], ["ゼ", "ze"], ["ゾ", "zo"],
  ["ダ", "da"], ["ヂ", "ji"], ["ヅ", "zu"], ["デ", "de"], ["ド", "do"],
  ["バ", "ba"], ["ビ", "bi"], ["ブ", "bu"], ["ベ", "be"], ["ボ", "bo"],
  ["パ", "pa"], ["ピ", "pi"], ["プ", "pu"], ["ペ", "pe"], ["ポ", "po"],
  ["ヴ", "vu"],
];

export function kataToRomaji(kata: string): string {
  let s = kata;
  let out = "";
  while (s.length > 0) {
    if (s[0] === "ッ") {
      // 促音: 次の音の子音を重ねる
      const rest = kataToRomaji(s.slice(1));
      out += rest.length > 0 ? rest[0] + rest : rest;
      return out;
    }
    if (s[0] === "ー") {
      s = s.slice(1);
      continue;
    }
    let matched = false;
    for (const [k, r] of ROMAJI) {
      if (s.startsWith(k)) {
        out += r;
        s = s.slice(k.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += s[0].toLowerCase();
      s = s.slice(1);
    }
  }
  return out;
}

export type StudentEntry = { name: string; aliases: string[] };

export type ResolveResult =
  | { ok: true; name: string }
  | { ok: false; token: string; candidates: string[] };

// 入力トークン1つを生徒名に解決する。
// 優先順: 完全一致 → ひらがな→カタカナ一致 → 別名一致 → ローマ字一致 → 部分一致(唯一なら採用)
export function resolveToken(token: string, students: StudentEntry[]): ResolveResult {
  const t = token.trim();
  if (!t) return { ok: false, token, candidates: [] };
  const kata = hiraToKata(t);
  const lower = t.toLowerCase();

  const exact = students.find((s) => s.name === t || s.name === kata);
  if (exact) return { ok: true, name: exact.name };

  const byAlias = students.find((s) =>
    s.aliases.some((a) => a === t || a === kata || hiraToKata(a) === kata)
  );
  if (byAlias) return { ok: true, name: byAlias.name };

  if (/^[a-zA-Z]+$/.test(t)) {
    const byRomaji = students.find((s) => kataToRomaji(s.name) === lower);
    if (byRomaji) return { ok: true, name: byRomaji.name };
  }

  const partial = students.filter(
    (s) =>
      s.name.includes(kata) ||
      s.aliases.some((a) => a.includes(t) || a.includes(kata)) ||
      (/^[a-zA-Z]+$/.test(t) && kataToRomaji(s.name).includes(lower))
  );
  if (partial.length === 1) return { ok: true, name: partial[0].name };
  return { ok: false, token: t, candidates: partial.slice(0, 8).map((s) => s.name) };
}

// ツイート本文から生徒名を推定（タグ自動サジェスト用・管理人が確認する前提なので広めに拾う）
export function suggestTagsFromText(text: string, students: StudentEntry[]): string[] {
  const kataText = hiraToKata(text);
  const found: string[] = [];
  for (const s of students) {
    if (kataText.includes(s.name) || s.aliases.some((a) => a && text.includes(a))) {
      found.push(s.name);
    }
  }
  return found.slice(0, 6);
}

// テキストからハッシュタグを抽出（#の後ろ、空白や区切りまで）
function extractHashtags(text: string): string[] {
  const tags: string[] = [];
  const re = /[#＃]([^\s#＃、。,.!！?？]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) tags.push(m[1]);
  return tags;
}

// 自動タグ付け用の厳しめ検出。投稿者本人がハッシュタグ等で明示したキャラだけを拾い、
// 短い名前の部分一致による誤爆を避ける（管理人の確認を挟まず公開するため）。
export function autoDetectStudents(text: string, students: StudentEntry[]): string[] {
  const kataText = hiraToKata(text);
  const hashSet = new Set(extractHashtags(text).map((h) => hiraToKata(h.toLowerCase())));
  const found: string[] = [];
  for (const s of students) {
    const nameKata = hiraToKata(s.name.toLowerCase());
    // ハッシュタグに名前そのものがある（最も信頼できる）
    const byHashtag =
      hashSet.has(nameKata) ||
      s.aliases.some((a) => a && hashSet.has(hiraToKata(a.toLowerCase())));
    // 3文字以上の名前・別名は本文中の部分一致も許可（2文字以下は誤爆しやすいので不可）
    const bySubstring =
      (s.name.length >= 3 && kataText.includes(s.name)) ||
      s.aliases.some((a) => a && a.length >= 3 && text.includes(a));
    if (byHashtag || bySubstring) found.push(s.name);
  }
  return found.slice(0, 6);
}
