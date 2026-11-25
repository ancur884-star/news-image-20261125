// News Image (news-image-20261125) — entry program, Node 22, standard library only.
//
// The entry is one image: a newspaper front page summing up Wednesday
// 25 November 2026. The program copies entry.png from this repository to
// /output/entry.png, where the gate reads it. The program runs twice and
// both runs must write the same bytes, so it does nothing but copy.
//
// What the image shows, and why:
//   Lead — a Houthi drone hits a Riyadh tower. A drone strikes a KAFD
//   skyscraper, wounding 11, and a tanker burns in the Strait of Hormuz
//   as Brent crude jumps 2.27% to $91.40. The day's biggest story, and
//   the one that moved oil markets, so it leads with the largest photo
//   (a scorched tower with smoke rising over Riyadh's financial district).
//   COP31 collapses without a deal — the first climate summit since
//   Copenhagen 2009 to end with no agreement; a $120B funding demand
//   goes unmet.
//   Anthropic falls below its IPO price — shares close at $81.91, down
//   6.54%; Nasdaq slides 1.48% as the Dow reclaims 50,000.
//   Also today — Huawei convicted on 10 counts in a US trial, the
//   Zaporizhzhia strike wounding 44 and killing two, a record 5,258
//   UK heat deaths, and Bangladesh protests halting 481 factories.
//   The market strip at the foot (S&P 500 -0.50%, Nasdaq -1.48%,
//   Dow +0.85%, Brent $91.40 +2.27%, gold -2.13%) closes the day's
//   picture.
//
// How it was made, in this session: the day's news was researched with
// a Deep Research report on 25 November's events, cross-checked against
// live news sources; three photo panels (a scorched Riyadh tower, the
// COP31 plenary, a trading floor with red screens) were generated in
// this session with an image model; the front page — masthead, date,
// headlines, captions and the market strip — was composed here with a
// Python/Pillow script so every word is exact and legible. The judge has
// no news feed, so the image itself carries the news.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = new URL("./entry.png", import.meta.url);

// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024
// pixels: refuse a file that breaks those limits here instead of handing
// the gate an image it would score 0.
const bytes = readFileSync(source);
const isPng = bytes.length > 24 && bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
if (!isPng) {
  console.error("entry.png is not a PNG");
  process.exit(1);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
const size = statSync(source).size;
if (width > 1024 || height > 1024 || size > 1024 * 1024) {
  console.error(`entry.png is ${width}x${height}, ${size} bytes: over the 1024x1024 / 1 MiB gate`);
  process.exit(1);
}
// The gate also requires a whole image: a PNG must end with its IEND
// chunk, so refuse a truncated file instead of handing the gate bytes
// it would score 0.
const iend = bytes.subarray(size - 12);
if (iend.readUInt32BE(0) !== 0 || iend.toString("ascii", 4, 8) !== "IEND") {
  console.error("entry.png is truncated: no IEND chunk at the end");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, "entry.png"));
console.log(`entry.png copied: ${width}x${height}, ${size} bytes`);
