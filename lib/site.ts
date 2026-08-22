// サイト名・URL・説明はここで一元管理（変更はこのファイルだけでOK）
export const SITE_NAME = "彩りアートアーカイブ";
export const SITE_URL = "https://irodori-art-archive.com";
// 検索結果のスニペットに出る説明文。Googleが表示するのは日本語で90〜120字程度なので、
// 前半に「何ができるサイトか」を置く。
export const SITE_DESC =
  "X(旧Twitter)に投稿されたブルーアーカイブのファンアートを、キャラ名タグで検索できる非公式まとめサイト。生徒ごとの一覧・人気順・週間ランキングから好きなイラストを探せます。";

// OGP画像に載せる短い一文（SITE_DESCは長すぎて画像内で折り返しすぎるため別に持つ）
export const SITE_TAGLINE = "ブルーアーカイブのファンアートをキャラ名で検索";

// 運営者情報（利用規約ページに表示される）。
// 連絡窓口は必須（絵師からの削除依頼・権利者からの連絡・アフィリエイト審査で求められる）。
export const SITE_OPERATOR = "yuma";
// Xのアカウント名（先頭の @ は含めない）
export const SITE_CONTACT_X = "yuma_yuma_alone";
export const SITE_CONTACT_X_URL = `https://x.com/${SITE_CONTACT_X}`;
