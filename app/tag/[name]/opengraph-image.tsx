import { ImageResponse } from "next/og";
import { searchPosts, studentEntries } from "@/lib/db";
import { resolveToken } from "@/lib/normalize";
import { loadJaFont } from "@/lib/ogFont";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const alt = `${SITE_NAME} タグページ`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HOST = SITE_URL.replace(/^https?:\/\//, "");

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const raw = decodeURIComponent((await params).name);
  const r = resolveToken(raw, studentEntries());
  const name = r.ok ? r.name : raw;
  // OG画像はモードCookieに関係なく健全版の件数を出す
  const { total } = searchPosts({
    tags: r.ok ? [name] : [],
    sort: "new",
    page: 1,
    perPage: 1,
    rating: "all",
    taggedOnly: true,
  });

  const label = "のファンアート・イラスト一覧";
  const countLabel = total > 0 ? `${total}件掲載` : "";
  const font = await loadJaFont(name + label + countLabel + SITE_NAME + HOST);

  const heading = font ? name : raw;
  const sub = font ? label : "fan-art collection";
  const footer = font ? SITE_NAME : "IRODORI ART ARCHIVE";

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
        <div style={{ display: "flex", fontSize: 110, fontWeight: 800 }}>{heading}</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: "#2c5d8c" }}>
          {sub}
        </div>
        {font && countLabel && (
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 30,
              color: "#ffffff",
              background: "#38a3f5",
              borderRadius: 9999,
              padding: "10px 36px",
            }}
          >
            {countLabel}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            color: "#3b6c99",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 9999,
              border: "6px solid #38a3f5",
              transform: "rotate(-12deg) scaleY(0.8)",
            }}
          />
          <div style={{ display: "flex" }}>{footer}</div>
          <div style={{ display: "flex", fontWeight: 400, color: "#5a86ad" }}>{HOST}</div>
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
