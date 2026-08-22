// app/icon.svg から app/favicon.ico を生成する。
// アイコンのデザインを変えたら icon.svg を直して `node scripts/build-favicon.mjs` を実行する。
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SIZES = [16, 32, 48];
const root = path.join(import.meta.dirname, "..");
const svg = fs.readFileSync(path.join(root, "app/icon.svg"));

const pngs = await Promise.all(
  SIZES.map((s) => sharp(svg, { density: 384 }).resize(s, s).png({ compressionLevel: 9 }).toBuffer())
);

// ICO: 6バイトのヘッダ + 16バイト×枚数のディレクトリ + PNG本体（Vista以降はPNG埋め込み可）
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(SIZES.length, 4);

let offset = 6 + 16 * SIZES.length;
const dir = SIZES.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0); // width
  e.writeUInt8(size === 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2); // パレット色数（トゥルーカラーは0）
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bit depth
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});

const out = Buffer.concat([header, ...dir, ...pngs]);
fs.writeFileSync(path.join(root, "app/favicon.ico"), out);
console.log(`favicon.ico を生成しました: ${SIZES.join("/")}px, ${out.length} bytes`);
