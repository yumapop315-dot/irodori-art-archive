// 構造化データ(JSON-LD)の埋め込み。<をエスケープしてXSSを防ぐ（Next公式ガイド準拠）
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
