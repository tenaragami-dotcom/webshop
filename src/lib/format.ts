export function formatPrice(yen: number): string {
  return `¥${yen.toLocaleString("ja-JP")}（税込）`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
