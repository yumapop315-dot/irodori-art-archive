// OG画像(ImageResponse/Satori)用の日本語フォント読み込み。
// Satoriはwoff2非対応のため、Google Fontsのcss2 APIから
// 「使う文字だけのサブセットttf」を実行時に取得する（Vercel公式例と同方式）。
// 取得失敗時はnullを返し、呼び出し側は英語表記にフォールバックする。
export async function loadJaFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@800&text=${encodeURIComponent(text)}`
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    // UAなしのfetchにはttf/otfのURLが返る
    const m = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!m) return null;
    const fontRes = await fetch(m[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}
