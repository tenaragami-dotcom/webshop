export const MIN_FILL_MS = 2000;

// 人間には見えない欄（website）が埋まっている、またはページを開いてから
// 極端に短い時間で送信された場合はボットとみなす。
export function looksLikeBot(website: string | undefined, elapsedMs: number | undefined): boolean {
  return !!website || (elapsedMs !== undefined && elapsedMs < MIN_FILL_MS);
}
