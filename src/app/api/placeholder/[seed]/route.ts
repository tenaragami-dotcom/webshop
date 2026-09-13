import { NextRequest } from "next/server";

// Deterministic hash so the same seed always renders the same placeholder image.
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PALETTES = [
  ["#f7e7e3", "#e8c4bb"],
  ["#f4ecd8", "#dcc27a"],
  ["#f0e6f6", "#c9a7dd"],
  ["#eef2e6", "#b7c9a1"],
  ["#fbeef0", "#e3a9b8"],
  ["#f2ede3", "#cbb994"],
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;
  const { searchParams } = new URL(req.url);
  const width = Number(searchParams.get("w") ?? 600);
  const height = Number(searchParams.get("h") ?? 750);
  const label = searchParams.get("label") ?? "";

  const hash = hashSeed(seed);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const cx = width / 2;
  const cy = height / 2 - height * 0.05;
  const r = Math.min(width, height) * 0.16;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g-${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g-${seed})" />
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.85" />
  <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#ffffff" opacity="0.55" />
  <text x="${width / 2}" y="${height * 0.82}" text-anchor="middle" font-family="'Georgia', serif" font-size="${Math.max(14, width * 0.045)}" fill="#6b5b53" letter-spacing="2">
    ${escapeXml(label)}
  </text>
</svg>`.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
