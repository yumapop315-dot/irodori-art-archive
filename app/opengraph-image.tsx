import { ImageResponse } from "next/og";
import { loadJaFont } from "@/lib/ogFont";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HOST = SITE_URL.replace(/^https?:\/\//, "");

export default async function Image() {
  const title = SITE_NAME;
  const desc = SITE_TAGLINE;
  const font = await loadJaFont(title + desc + HOST);

  // フォントが取れなかったら英語表記（豆腐文字を避ける）
  const heading = font ? title : "IRODORI ART ARCHIVE";
  const sub = font ? desc : "Blue Archive fan-art search";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e8f4fd 0%, #cfe9fb 55%, #a9d8f7 100%)",
          color: "#12395e",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 84,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              border: "10px solid #38a3f5",
              transform: "rotate(-12deg) scaleY(0.8)",
            }}
          />
          <div style={{ display: "flex" }}>{heading}</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            color: "#3b6c99",
            textAlign: "center",
            maxWidth: 960,
          }}
        >
          {sub}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            color: "#5a86ad",
            letterSpacing: 2,
          }}
        >
          {HOST}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "mplus", data: font, weight: 800, style: "normal" }]
        : undefined,
    }
  );
}
