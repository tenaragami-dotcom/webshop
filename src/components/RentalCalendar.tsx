"use client";

import { useState } from "react";
import { addDaysStr, earliestBookableDate } from "@/lib/rental-plan";

type BookedRange = { startDate: string; endDate: string };

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function RentalCalendar({
  bookedRanges,
  selected,
  onSelect,
  occupiedDays,
  label,
}: {
  bookedRanges: BookedRange[];
  selected: string | null;
  onSelect: (date: string) => void;
  occupiedDays: number;
  label?: string;
}) {
  const minDate = earliestBookableDate();
  const initial = selected ? new Date(selected) : new Date(minDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  function isRangeClear(startStr: string) {
    const endStr = addDaysStr(startStr, occupiedDays - 1);
    return !bookedRanges.some(
      (r) => startStr <= r.endDate.slice(0, 10) && r.startDate.slice(0, 10) <= endStr
    );
  }

  function isSelectable(dateStr: string) {
    return dateStr >= minDate && isRangeClear(dateStr);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(viewYear, viewMonth, d));

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const selectedEnd = selected ? addDaysStr(selected, occupiedDays - 1) : null;

  return (
    <div className="border border-line p-3">
      {label && <p className="mb-2 text-xs tracking-wide-jp text-charcoal-soft">{label}</p>}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={prevMonth}
          className="px-2 py-1 hover:text-gold"
          aria-label="前の月"
        >
          ‹
        </button>
        <p className="tracking-wide-jp">
          {viewYear}年{viewMonth + 1}月
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="px-2 py-1 hover:text-gold"
          aria-label="次の月"
        >
          ›
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-charcoal-soft">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;
          const selectable = isSelectable(dateStr);
          const isSelected = selected === dateStr;
          const inRange =
            !!selected && !!selectedEnd && dateStr >= selected && dateStr <= selectedEnd;
          return (
            <button
              type="button"
              key={dateStr}
              disabled={!selectable}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded text-[11px] ${
                isSelected
                  ? "bg-charcoal text-white"
                  : inRange
                    ? "bg-blush text-charcoal"
                    : !selectable
                      ? "cursor-not-allowed text-line line-through"
                      : "hover:bg-blush/60"
              }`}
            >
              {Number(dateStr.slice(-2))}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-charcoal-soft">
        グレー表示（取り消し線）の日程はご利用いただけません。ご利用日の10日前までにお申し込みください。
      </p>
    </div>
  );
}
