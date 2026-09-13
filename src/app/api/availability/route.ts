import { NextRequest, NextResponse } from "next/server";
import { isRangeAvailable } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!productId || !start || !end) {
    return NextResponse.json(
      { error: "productId, start, end は必須です" },
      { status: 400 }
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "日付が不正です" }, { status: 400 });
  }
  if (startDate > endDate) {
    return NextResponse.json(
      { error: "開始日は終了日より前にしてください" },
      { status: 400 }
    );
  }

  const available = await isRangeAvailable(productId, startDate, endDate);
  return NextResponse.json({ available });
}
