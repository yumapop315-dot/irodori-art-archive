// DLsiteアフィリエイトのリンク生成。
// 成人向けの導線なので、きわどい版・R18版でのみ使うこと（健全版に出すとAdSenseポリシー違反）。
// NEXT_PUBLIC_DLSITE_AFF_ID が未設定の間は全てnullを返し、枠ごと非表示になる。

const AFF_ID = process.env.NEXT_PUBLIC_DLSITE_AFF_ID;

// アフィリリンクの形式はDLsite側でドメイン移行(www.dlsite.com → dlaf.jp)が進行中のため、
// コードに埋め込まず環境変数で差し替えられるようにしておく。
// {aid} = アフィリエイトID / {url} = リンク先URL(エンコード済み)
// ※必ずDLsiteの管理画面で実際に生成したリンクと形式を突き合わせて確認すること。
//   形式が違うと踏まれても成果が計上されない（エラーにならないので気づけない）。
const LINK_TEMPLATE =
  process.env.NEXT_PUBLIC_DLSITE_AFF_TEMPLATE ??
  "https://dlaf.jp/maniax/dlaf/=/aid/{aid}/url/{url}";

export const dlsiteEnabled = Boolean(AFF_ID);

// 任意のDLsiteページURLをアフィリエイトリンクに変換する
export function dlsiteAffiliate(rawUrl: string): string | null {
  if (!AFF_ID) return null;
  return LINK_TEMPLATE.replace("{aid}", encodeURIComponent(AFF_ID)).replace(
    "{url}",
    encodeURIComponent(rawUrl)
  );
}

// 同人(maniax)のキーワード検索ページ。売れ筋順で表示する。
// 実測した仕様（外すと403になる）:
//   - 並び順は order/trend ではなく order[0]/trend
//   - 複数語の区切りは %20 ではなく + でなければ弾かれる
export function dlsiteSearchUrl(keyword: string): string {
  const kw = encodeURIComponent(keyword).replace(/%20/g, "+");
  return `https://www.dlsite.com/maniax/fsr/=/language/jp/keyword/${kw}/order%5B0%5D/trend/`;
}

// キャラ名から「ブルアカ+そのキャラ」の検索アフィリリンクを作る。
// キャラ名なし(トップ等)ならブルーアーカイブ全体の検索へ。
export function dlsitePromoLink(character?: string | null): {
  url: string;
  keyword: string;
} | null {
  const keyword = character ? `ブルーアーカイブ ${character}` : "ブルーアーカイブ";
  const url = dlsiteAffiliate(dlsiteSearchUrl(keyword));
  return url ? { url, keyword } : null;
}
